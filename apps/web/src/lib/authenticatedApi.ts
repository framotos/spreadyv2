'use client';

import axios from 'axios';
import { apiClient } from './apiClient';
import type { AskRequest, AskResponse, Session, BackendSession, Message } from '@/lib/types';
// Keep type imports even if fields are removed, as the base interfaces are still used
import type { BackendMessage } from './types';

// Cache-Funktionalität (hier vereinfacht)
let sessionsCache: Session[] | null = null;
let sessionsCacheTime: number = 0;
const CACHE_EXPIRY_MS = 5000; // 5 Sekunden Cache-Gültigkeit

// Cache Invalidierung
const invalidateCache = () => {
  sessionsCache = null;
};

/**
 * Aktualisiert oder erstellt eine Session
 */
export const updateSession = async (
  sessionId: string, 
  htmlFiles: string[], 
  outputFolder: string,
  lastMessage: string
): Promise<Session> => {
  try {
    const response = await apiClient.put<BackendSession>(`/sessions/${sessionId}`, {
      html_files: htmlFiles,
      output_folder: outputFolder,
      last_message: lastMessage
    });
    
    const updatedSession: Session = {
      id: response.data.id,
      lastMessage: response.data.last_message || 'Neue Konversation',
      timestamp: response.data.timestamp || new Date().toISOString(),
      htmlFiles: response.data.html_files || [],
      outputFolder: response.data.output_folder || outputFolder
    };
    
    invalidateCache();
    return updatedSession;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Session:', error);
    throw error;
  }
};

/**
 * Ruft die Nachrichten für eine bestimmte Sitzung ab.
 * Returns the frontend Message type array.
 */
export const getSessionMessages = async (sessionId: string, token: string): Promise<Message[]> => {
  console.log('getSessionMessages called for sessionId:', sessionId);
  try {
    // Assume the backend returns data compatible with Frontend Message type
    const response = await apiClient.get<Message[]>(`/sessions/${sessionId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Received messages from /sessions/:sessionId/messages:', response.data);
    // Ensure response conforms to Message[] type
    const messages: Message[] = response.data.map(msg => ({
      id: msg.id,
      userId: msg.userId,
      content: msg.content,
      sender: msg.sender,
      htmlFiles: msg.htmlFiles || [], // Ensure arrays exist
      outputFolder: msg.outputFolder,
      timestamp: msg.timestamp
    }));
    return messages;
  } catch (error) {
    console.error('Error calling /sessions/:sessionId/messages endpoint:', error);
     if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Fehler beim Abrufen der Nachrichten');
    } else {
      throw new Error('Unbekannter Fehler beim Abrufen der Nachrichten');
    }
  }
};

/**
 * Stellt eine Frage an den Backend-Agenten für eine bestimmte Sitzung.
 */
export const askQuestion = async (
  sessionId: string, 
  question: string, 
  token: string
): Promise<AskResponse> => {
  console.log('askQuestion called with:', { sessionId, question });
  
  // Construct payload without dataset_type and years
  const payload: AskRequest = {
    session_id: sessionId,
    question,
  };
  
  console.log('Sending payload to /ask:', payload);

  try {
    const response = await apiClient.post<AskResponse>('/ask', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Received response from /ask:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling /ask endpoint:', error);
    // Handle specific Axios errors or re-throw
    if (axios.isAxiosError(error)) {
      // Log more details if available
      console.error('Axios error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Fehler bei der Anfrage an den Agenten');
    } else {
      throw new Error('Unbekannter Fehler bei der Anfrage an den Agenten');
    }
  }
};

/**
 * Holt alle Sessions des aktuellen Benutzers
 */
export const getSessions = async (): Promise<Session[]> => {
  // Cache-Check
  const now = Date.now();
  if (sessionsCache && now - sessionsCacheTime < CACHE_EXPIRY_MS) {
    return sessionsCache;
  }
  
  try {
    const response = await apiClient.get<BackendSession[]>(`/sessions`);
    
    const transformedSessions = response.data.map((session: BackendSession) => ({
      id: session.id,
      userId: session.user_id,
      lastMessage: session.last_message || 'Neue Konversation',
      timestamp: session.timestamp || new Date().toISOString(),
      htmlFiles: session.html_files || [],
      outputFolder: session.output_folder
    }));
    
    sessionsCache = transformedSessions;
    sessionsCacheTime = now;
    
    return transformedSessions;
  } catch (error) {
    console.error('Fehler beim Abrufen der Sitzungen:', error);
    throw error;
  }
};

/**
 * Erstellt eine neue Session
 */
export const createSession = async (sessionId: string): Promise<Session> => {
  try {
    const outputFolder = `user_question_output_${sessionId.substring(0, 4)}`;
    
    const updatedSession = await updateSession(
      sessionId,
      [],
      outputFolder,
      'Neue Konversation'
    );
    
    return updatedSession;
  } catch (error) {
    console.error('Fehler beim Erstellen der Sitzung:', error);
    throw error;
  }
};

/**
 * Fügt eine Nachricht zu einer Sitzung hinzu.
 * Sends only content and sender, aligning with BackendMessage type.
 */
export const addMessage = async (
  sessionId: string, 
  content: string, 
  sender: 'user' | 'assistant', 
  token: string
): Promise<BackendMessage> => { // Expects BackendMessage response
  const payload = {
    content,
    sender,
    // html_files and output_folder are NOT sent as they are not in BackendMessage type
  };
  console.log('Sending payload to /sessions/:sessionId/messages:', payload);
  try {
    const response = await apiClient.post<BackendMessage>(
      `/sessions/${sessionId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log('Received response from /sessions/:sessionId/messages:', response.data);
    // Return the BackendMessage as received
    return response.data; 
  } catch (error) {
    console.error('Error calling /sessions/:sessionId/messages endpoint:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Fehler beim Hinzufügen der Nachricht');
    } else {
      throw new Error('Unbekannter Fehler beim Hinzufügen der Nachricht');
    }
  }
}; 