'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatContainerProps, Message } from '@/lib/types';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { getSessionMessages, askQuestion } from '@/lib/authenticatedApi';
import { useAuth } from '@/lib/auth/AuthContext';

/**
 * Container-Komponente für den Chat-Bereich
 */
const ChatContainer: React.FC<ChatContainerProps> = ({ 
  currentSessionId, 
  onSessionUpdate,
  selectedHtmlFile 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Nachrichten laden, wenn die Session sich ändert
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentSessionId || !user) return;
      
      try {
        const fetchedMessages = await getSessionMessages(currentSessionId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
      }
    };
    
    fetchMessages();
  }, [currentSessionId, user]);

  // Nachrichtenbereich scrollen, wenn neue Nachrichten eintreffen
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ausgewählte HTML-Datei anzeigen
  useEffect(() => {
    if (selectedHtmlFile) {
      const iframeContainer = document.getElementById('iframe-container');
      if (iframeContainer) {
        iframeContainer.innerHTML = ''; // Leere den Container
        
        const iframe = document.createElement('iframe');
        iframe.src = `/user_output/${selectedHtmlFile.outputFolder}/${selectedHtmlFile.fileName}`;
        iframe.className = 'w-full h-full border-0';
        iframe.title = selectedHtmlFile.fileName;
        
        iframeContainer.appendChild(iframe);
      }
    }
  }, [selectedHtmlFile]);

  // Nachricht senden
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentSessionId || !user) return;
    
    // Optimistisches Update der UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Anfrage an das Backend senden
      const { message: assistantMessage, updatedSession } = await askQuestion(currentSessionId, message);
      
      // Antwort hinzufügen
      setMessages(prev => [...prev, assistantMessage]);
      
      // Session aktualisieren
      if (updatedSession) {
        onSessionUpdate(updatedSession);
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      // Fehlerbehandlung hier...
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Nachrichten */}
      <div className="flex-1 overflow-auto p-4">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Keine Nachrichten in dieser Sitzung. Starte eine Konversation!</p>
          </div>
        )}
      </div>
      
      {/* HTML-Visualisierung */}
      {selectedHtmlFile && (
        <div className="flex-1 border-t border-gray-200">
          <div id="iframe-container" className="w-full h-full"></div>
        </div>
      )}
      
      {/* Eingabefeld */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer; 