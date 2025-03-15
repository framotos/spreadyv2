import axios from 'axios';
import { AskRequest, AskResponse, Session, BackendSession, BackendMessage, Message } from '@/lib/types';

// Korrigiere die API-Basis-URL, um sicherzustellen, dass sie korrekt ist
const API_BASE_URL = 'http://localhost:8000';

// Funktion zum Senden einer Frage an den Agenten
export const askQuestion = async (sessionId: string, question: string): Promise<Message> => {
  try {
    // TODO: BACKEND-INTEGRATION - Diese Funktion sollte erweitert werden, um zusätzliche Parameter
    // wie datasetType und years zu unterstützen, sobald das Backend diese Parameter verarbeiten kann.
    const request: AskRequest = {
      session_id: sessionId,
      question: question
    };
    
    const response = await axios.post<AskResponse>(`${API_BASE_URL}/ask`, request);
    
    return {
      id: crypto.randomUUID(),
      content: response.data.answer,
      sender: 'assistant',
      htmlFiles: response.data.html_files
    };
  } catch (error) {
    console.error('Fehler beim Senden der Frage:', error);
    throw error;
  }
};

// Funktion zum Abrufen aller Sitzungen
export const getSessions = async (): Promise<Session[]> => {
  try {
    // TODO: BACKEND-INTEGRATION - Diese Funktion versucht, Sitzungen vom Backend abzurufen,
    // aber der Endpunkt /sessions existiert noch nicht. Sobald er implementiert ist,
    // sollte der Mock-Daten-Fallback entfernt werden.
    const response = await axios.get<BackendSession[]>(`${API_BASE_URL}/sessions`);
    
    // Transformiere die Daten in das erwartete Format
    return response.data.map((session: BackendSession) => ({
      id: session.id,
      lastMessage: session.last_message || 'Neue Konversation',
      timestamp: session.timestamp || new Date().toISOString(),
      htmlFiles: session.html_files || []
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Sitzungen:', error);
    
    // Für Entwicklungszwecke: Gib Beispieldaten zurück, wenn der API-Aufruf fehlschlägt
    console.log('Verwende Mock-Daten für Sitzungen');
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
    // TODO: BACKEND-INTEGRATION - Diese Funktion sollte eine tatsächliche API-Anfrage senden,
    // sobald der entsprechende Backend-Endpunkt implementiert ist.
    // const response = await axios.post<BackendSession>(`${API_BASE_URL}/sessions`, { id: sessionId });
    // return {
    //   id: response.data.id,
    //   lastMessage: response.data.last_message || 'Neue Konversation',
    //   timestamp: response.data.timestamp || new Date().toISOString(),
    //   htmlFiles: response.data.html_files || []
    // };
    
    // Für Entwicklungszwecke: Erstelle eine lokale Sitzung
    console.log('Erstelle lokale Sitzung:', sessionId);
    return {
      id: sessionId,
      lastMessage: 'Neue Konversation',
      timestamp: new Date().toISOString(),
      htmlFiles: []
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Sitzung:', error);
    throw error;
  }
};

// Mock-Daten für die Entwicklung
const getMockSessions = (): Session[] => {
  // TODO: BACKEND-INTEGRATION - Diese Funktion liefert Mock-Daten und sollte entfernt werden,
  // sobald das Backend vollständig implementiert ist.
  return [
    {
      id: '1',
      lastMessage: 'Was ist das durchschnittliche KGV von US Pharmaunternehmen?',
      timestamp: new Date().toISOString(),
      htmlFiles: ['chart1.html', 'chart2.html']
    },
    {
      id: '2',
      lastMessage: 'Welche Branche hatte das größte Wachstum?',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 Stunde zurück
      htmlFiles: ['growth_chart.html']
    },
    {
      id: '3',
      lastMessage: 'Vergleiche Apples Assets mit Wettbewerbern',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 Stunden zurück
      htmlFiles: ['apple_comparison.html', 'sector_analysis.html']
    }
  ];
}; 