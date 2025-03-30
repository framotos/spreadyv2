'use client';

import axios from 'axios';
import { AskRequest, AskResponse, Session, BackendSession, Message } from '@/lib/types';
import { generateUUID } from '@/lib/utils';

// Backend-Message-Interface
interface BackendMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  html_files?: string[];
  output_folder?: string;
}

// Korrigiere die API-Basis-URL, um sicherzustellen, dass sie korrekt ist
const API_BASE_URL = 'http://localhost:8000';

// Caching-Mechanismus für Sessions
let sessionsCache: Session[] | null = null;
let sessionsCacheTime: number = 0;
const CACHE_EXPIRY_MS = 5000; // 5 Sekunden Cache-Gültigkeit

// Cache Invalidierung
const invalidateCache = () => {
  sessionsCache = null;
};

// Speicher für Mock-Daten
const mockSessionsData: Session[] = [
  {
    id: '1',
    lastMessage: 'Was ist das durchschnittliche KGV von US Pharmaunternehmen?',
    timestamp: new Date().toISOString(),
    htmlFiles: ['chart1.html', 'chart2.html'],
    outputFolder: 'user_question_output_c16c'
  },
  {
    id: '2',
    lastMessage: 'Welche Branche hatte das größte Wachstum?',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 Stunde zurück
    htmlFiles: ['growth_chart.html'],
    outputFolder: 'user_question_output_f3e9'
  },
  {
    id: '3',
    lastMessage: 'Vergleiche Apples Assets mit Wettbewerbern',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 Stunden zurück
    htmlFiles: ['apple_comparison.html', 'sector_analysis.html'],
    outputFolder: 'user_question_output_aa7d'
  }
];

// Funktion zum Aktualisieren oder Erstellen einer Session
const updateSession = async (
  sessionId: string, 
  htmlFiles: string[], 
  outputFolder: string,
  lastMessage: string
): Promise<Session> => {
  try {
    // Sende die Session-Update-Anfrage an das Backend
    const response = await axios.put<BackendSession>(`${API_BASE_URL}/sessions/${sessionId}`, {
      html_files: htmlFiles,
      output_folder: outputFolder,
      last_message: lastMessage
    });
    
    // Transformiere die Antwort in das erwartete Format
    const updatedSession: Session = {
      id: response.data.id,
      lastMessage: response.data.last_message || 'Neue Konversation',
      timestamp: response.data.timestamp || new Date().toISOString(),
      htmlFiles: response.data.html_files || [],
      outputFolder: response.data.output_folder || outputFolder
    };
    
    // Cache invalidieren, damit beim nächsten Aufruf neue Daten geladen werden
    invalidateCache();
    
    return updatedSession;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Session:', error);
    
    // Fallback auf Mock-Daten, wenn der API-Aufruf fehlschlägt
    const sessionIndex = mockSessionsData.findIndex(s => s.id === sessionId);
    let updatedSession: Session;
    
    if (sessionIndex !== -1) {
      updatedSession = {
        ...mockSessionsData[sessionIndex],
        htmlFiles: htmlFiles,
        outputFolder: outputFolder,
        lastMessage: lastMessage
      };
      
      mockSessionsData[sessionIndex] = updatedSession;
    } else {
      // Füge eine neue Session hinzu, falls sie noch nicht existiert
      updatedSession = {
        id: sessionId,
        lastMessage: lastMessage,
        timestamp: new Date().toISOString(),
        htmlFiles: htmlFiles,
        outputFolder: outputFolder
      };
      
      mockSessionsData.unshift(updatedSession);
    }
    
    return updatedSession;
  }
};

// Neue Funktion zum Laden der Nachrichten einer Session
export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
  try {
    const response = await axios.get<BackendMessage[]>(`${API_BASE_URL}/sessions/${sessionId}/messages`);
    
    // Transformiere die Daten in das erwartete Format
    return response.data.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      htmlFiles: msg.html_files || [],
      outputFolder: msg.output_folder
    }));
  } catch (error) {
    console.error(`Fehler beim Abrufen der Nachrichten für Sitzung ${sessionId}:`, error);
    // Im Fehlerfall einfach eine leere Liste zurückgeben
    return [];
  }
};

// Aktualisiere die askQuestion-Funktion
export const askQuestion = async (sessionId: string, question: string): Promise<{message: Message, updatedSession: Session}> => {
  try {
    // Speichere zuerst die Benutzernachricht im Backend
    await axios.post<BackendMessage>(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
      content: question,
      sender: 'user'
    });
    
    // Sende dann die Anfrage an das Backend
    const request: AskRequest = { session_id: sessionId, question: question };
    const response = await axios.post<AskResponse>(`${API_BASE_URL}/ask`, request);
    
    // Transformiere für das Frontend (das Backend speichert die Nachricht bereits)
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

// Funktion zum Abrufen aller Sitzungen (mit Caching)
export const getSessions = async (): Promise<Session[]> => {
  // Überprüfe, ob der Cache noch gültig ist
  const now = Date.now();
  if (sessionsCache && now - sessionsCacheTime < CACHE_EXPIRY_MS) {
    return sessionsCache;
  }
  
  try {
    // Versuche, die Sessions vom Backend abzurufen
    const response = await axios.get<BackendSession[]>(`${API_BASE_URL}/sessions`);
    
    // Transformiere die Daten in das erwartete Format
    const transformedSessions = response.data.map((session: BackendSession) => ({
      id: session.id,
      lastMessage: session.last_message || 'Neue Konversation',
      timestamp: session.timestamp || new Date().toISOString(),
      htmlFiles: session.html_files || [],
      outputFolder: session.output_folder
    }));
    
    // Aktualisiere den Cache
    sessionsCache = transformedSessions;
    sessionsCacheTime = now;
    
    return transformedSessions;
  } catch (error) {
    console.error('Fehler beim Abrufen der Sitzungen:', error);
    
    // Für Entwicklungszwecke: Gib Beispieldaten zurück, wenn der API-Aufruf fehlschlägt
    return getMockSessions();
  }
};

// Funktion zum Erstellen einer neuen Sitzung
export const createSession = async (sessionId: string): Promise<Session> => {
  try {
    // Versuche, eine neue Session zu erstellen oder zu aktualisieren
    const outputFolder = `user_question_output_${sessionId.substring(0, 4)}`;
    
    const updatedSession = await updateSession(
      sessionId,
      [],  // Keine HTML-Dateien zu Beginn
      outputFolder,
      'Neue Konversation'
    );
    
    return updatedSession;
  } catch (error) {
    console.error('Fehler beim Erstellen der Sitzung:', error);
    throw error;
  }
};

// Mock-Daten für die Entwicklung
const getMockSessions = (): Session[] => {
  return mockSessionsData;
};