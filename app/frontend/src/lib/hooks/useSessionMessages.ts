import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/lib/types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Interface für die Backend Message
interface BackendMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';  // Exakter Typ wie im Message-Interface
  timestamp: string;
  html_files?: string[];
  output_folder?: string;
}

export function useSessionMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lade Nachrichten vom Backend
  const loadMessages = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<BackendMessage[]>(`${API_BASE_URL}/sessions/${sessionId}/messages`);
      
      // Transformiere die Backend-Nachrichten ins Frontend-Format
      const transformedMessages: Message[] = response.data.map((msg: BackendMessage) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        htmlFiles: msg.html_files || [],
        outputFolder: msg.output_folder || ''
      }));
      
      setMessages(transformedMessages);
    } catch (err) {
      console.error('Fehler beim Laden der Nachrichten:', err);
      setError('Die Nachrichten konnten nicht geladen werden.');
      
      // Fallback: Zeige zumindest eine Willkommensnachricht
      setMessages([{
        id: 'welcome',
        content: 'Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?',
        sender: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Füge eine neue Nachricht hinzu
  const addMessage = useCallback(async (content: string, sender: 'user' | 'assistant', htmlFiles?: string[], outputFolder?: string) => {
    if (!sessionId) return null;
    
    try {
      const response = await axios.post<BackendMessage>(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        content,
        sender,
        html_files: htmlFiles || [],
        output_folder: outputFolder || ''
      });
      
      // Transformiere die neue Nachricht ins Frontend-Format
      const newMessage: Message = {
        id: response.data.id,
        content: response.data.content,
        sender: response.data.sender,
        htmlFiles: response.data.html_files || [],
        outputFolder: response.data.output_folder || ''
      };
      
      // Aktualisiere den lokalen State
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Nachricht:', err);
      setError('Die Nachricht konnte nicht gespeichert werden.');
      return null;
    }
  }, [sessionId]);

  // Füge eine Nachricht lokal hinzu, ohne auf den Server zu warten
  const addLocalMessage = useCallback((content: string, sender: 'user' | 'assistant', htmlFiles: string[] = [], outputFolder: string = '') => {
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      sender,
      htmlFiles,
      outputFolder
    };
    
    setMessages(prev => [...prev, tempMessage]);
    return tempMessage;
  }, []);

  // Lade Nachrichten beim ersten Rendering und bei Änderung der Session-ID
  useEffect(() => {
    if (sessionId) {
      loadMessages();
    } else {
      // Setze Nachrichten zurück, wenn keine Session ausgewählt ist
      setMessages([]);
    }
  }, [sessionId, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
    addMessage,
    addLocalMessage
  };
} 