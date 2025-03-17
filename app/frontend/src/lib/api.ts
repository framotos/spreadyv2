import axios from 'axios';
import { AskRequest, AskResponse, Session, BackendSession, BackendMessage, Message } from '@/lib/types';
import { generateUUID } from '@/lib/utils';

// Korrigiere die API-Basis-URL, um sicherzustellen, dass sie korrekt ist
const API_BASE_URL = 'http://localhost:8000';

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
      
      console.log('Session aktualisiert (Mock, da API-Fehler):', updatedSession);
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
      
      console.log('Neue Session erstellt (Mock, da API-Fehler):', updatedSession);
    }
    
    return updatedSession;
  }
};

// Funktion zum Senden einer Frage an den Agenten
export const askQuestion = async (sessionId: string, question: string): Promise<{message: Message, updatedSession: Session}> => {
  try {
    // TODO: BACKEND-INTEGRATION - Diese Funktion sollte erweitert werden, um zusätzliche Parameter
    // wie datasetType und years zu unterstützen, sobald das Backend diese Parameter verarbeiten kann.
    const request: AskRequest = {
      session_id: sessionId,
      question: question
    };
    
    const response = await axios.post<AskResponse>(`${API_BASE_URL}/ask`, request);
    
    // Aktualisiere die Session mit den neuen HTML-Dateien
    const updatedSession = await updateSession(
      sessionId, 
      response.data.html_files, 
      response.data.output_folder,
      question
    );
    
    const message = {
      id: generateUUID(),
      content: response.data.answer,
      sender: 'assistant' as const,
      htmlFiles: response.data.html_files,
      outputFolder: response.data.output_folder
    };
    
    return {
      message,
      updatedSession
    };
  } catch (error) {
    console.error('Fehler beim Senden der Frage:', error);
    throw error;
  }
};

// Funktion zum Abrufen aller Sitzungen
export const getSessions = async (): Promise<Session[]> => {
  try {
    console.log('API: Versuche Sessions vom Backend abzurufen...');
    // Versuche, die Sessions vom Backend abzurufen
    const response = await axios.get<BackendSession[]>(`${API_BASE_URL}/sessions`);
    
    console.log('API: Sessions erfolgreich abgerufen, Rohdaten:', response.data);
    
    // Transformiere die Daten in das erwartete Format
    const transformedSessions = response.data.map((session: BackendSession) => ({
      id: session.id,
      lastMessage: session.last_message || 'Neue Konversation',
      timestamp: session.timestamp || new Date().toISOString(),
      htmlFiles: session.html_files || [],
      outputFolder: session.output_folder
    }));
    
    console.log('API: Transformierte Sessions:', transformedSessions);
    return transformedSessions;
  } catch (error) {
    console.error('API: Fehler beim Abrufen der Sitzungen:', error);
    
    // Für Entwicklungszwecke: Gib Beispieldaten zurück, wenn der API-Aufruf fehlschlägt
    console.log('API: Verwende Mock-Daten für Sitzungen');
    return getMockSessions();
  }
};

// Funktion zum Abrufen der Nachrichten einer bestimmten Sitzung
export const getSessionMessages = async (sessionId: string): Promise<BackendMessage[]> => {
  try {
    // TODO: BACKEND-INTEGRATION - Diese Funktion versucht, Nachrichten vom Backend abzurufen,
    // aber der Endpunkt /sessions/:id/messages existiert noch nicht.
    const response = await axios.get<BackendMessage[]>(`${API_BASE_URL}/sessions/${sessionId}/messages`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen der Nachrichten für Sitzung ${sessionId}:`, error);
    // Für Entwicklungszwecke: Gib leere Liste zurück, wenn der API-Aufruf fehlschlägt
    return [];
  }
};

// Funktion zum Erstellen einer neuen Sitzung
export const createSession = async (sessionId: string): Promise<Session> => {
  try {
    // Versuche, eine neue Session zu erstellen oder zu aktualisieren
    const updatedSession = await updateSession(
      sessionId,
      [],  // Keine HTML-Dateien zu Beginn
      `user_question_output_${sessionId.substring(0, 4)}`,
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