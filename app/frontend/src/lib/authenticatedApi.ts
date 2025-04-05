'use client';

import { apiClient } from './apiClient';
import { AskRequest, AskResponse, Session, BackendSession, Message } from '@/lib/types';
import { generateUUID } from '@/lib/utils';

// Backend-Message-Interface
interface BackendMessage {
  id: string;
  user_id?: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  html_files?: string[];
  output_folder?: string;
}

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
 * Holt alle Nachrichten einer Session
 */
export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get<BackendMessage[]>(`/sessions/${sessionId}/messages`);
    
    return response.data.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      content: msg.content,
      sender: msg.sender,
      htmlFiles: msg.html_files || [],
      outputFolder: msg.output_folder
    }));
  } catch (error) {
    console.error(`Fehler beim Abrufen der Nachrichten für Sitzung ${sessionId}:`, error);
    return [];
  }
};

/**
 * Sendet eine Frage an den Assistenten
 */
export const askQuestion = async (sessionId: string, question: string): Promise<{message: Message, updatedSession: Session}> => {
  try {
    // Speichere zuerst die Benutzernachricht im Backend
    await apiClient.post<BackendMessage>(`/sessions/${sessionId}/messages`, {
      content: question,
      sender: 'user'
    });
    
    // Sende dann die Anfrage an das Backend
    const request: AskRequest = { session_id: sessionId, question: question };
    const response = await apiClient.post<AskResponse>(`/ask`, request);
    
    // Transformiere für das Frontend
    const message = {
      id: generateUUID(),
      content: response.data.answer,
      sender: 'assistant' as const,
      htmlFiles: response.data.html_files,
      outputFolder: response.data.output_folder
    };
    
    // Session-Update
    const updatedSession = await updateSession(
      sessionId, 
      response.data.html_files, 
      response.data.output_folder,
      question
    );
    
    return { message, updatedSession };
  } catch (error) {
    console.error('Fehler beim Senden der Frage:', error);
    throw error;
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