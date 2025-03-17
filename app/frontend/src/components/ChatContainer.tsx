import React, { useState, useRef, useEffect } from 'react';
import { askQuestion } from '@/lib/api';
import { DatasetType, Message, ChatContainerProps } from '@/lib/types';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { generateUUID } from '@/lib/utils';

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  currentSessionId, 
  onSessionUpdate,
  selectedHtmlFile = null
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lade Willkommensnachricht beim ersten Laden
  useEffect(() => {
    if (messages.length === 0 && !selectedHtmlFile) {
      setMessages([
        {
          id: generateUUID(),
          content: 'Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?',
          sender: 'assistant'
        }
      ]);
    }
  }, [messages.length, selectedHtmlFile]);

  // Scrolle zum Ende der Nachrichten, wenn neue Nachrichten hinzugefügt werden
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lade Nachrichten, wenn sich die Session-ID ändert
  useEffect(() => {
    // TODO: BACKEND-INTEGRATION - Hier sollten die Nachrichten für die aktuelle Sitzung
    // vom Backend abgerufen werden, sobald der entsprechende Endpunkt implementiert ist.
    // Beispiel: const messages = await getSessionMessages(currentSessionId);
    
    console.log("Session ID geändert:", currentSessionId);
    
    // Für jetzt setzen wir nur die Willkommensnachricht zurück
    if (!selectedHtmlFile) {
      setMessages([
        {
          id: generateUUID(),
          content: 'Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?',
          sender: 'assistant'
        }
      ]);
    }
  }, [currentSessionId, selectedHtmlFile]);

  const handleSendMessage = async (message: string, datasetType: DatasetType, years: number[]) => {
    if (!message.trim() || isLoading) return;

    // Füge die Benutzernachricht hinzu
    const userMessageId = generateUUID();
    const userMessage: Message = {
      id: userMessageId,
      content: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log("Sende Nachricht:", message, "an Session:", currentSessionId);
      console.log("Zusätzliche Parameter (für spätere Backend-Integration):", { datasetType, years });
      
      // Sende die Anfrage an den Server mit der neuen API-Funktion
      const response = await askQuestion(currentSessionId, message);
      
      console.log("Antwort erhalten:", response);
      
      // Füge die Antwort des Assistenten hinzu
      setMessages(prev => [...prev, response.message]);
      
      // Benachrichtige die übergeordnete Komponente über die Aktualisierung mit der aktualisierten Session
      onSessionUpdate(response.updatedSession);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      
      // Füge eine Fehlermeldung hinzu
      const errorMessage: Message = {
        id: generateUUID(),
        content: 'Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.',
        sender: 'assistant'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Wenn eine HTML-Datei direkt angezeigt werden soll
  if (selectedHtmlFile) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">{selectedHtmlFile.fileName}</h2>
          <p className="text-sm text-gray-500">Aus Session: {currentSessionId}</p>
        </div>
        <div className="flex-1 p-0">
          <iframe 
            src={`http://localhost:8000/user_output/${selectedHtmlFile.outputFolder}/${selectedHtmlFile.fileName}`}
            className="w-full h-full border-0"
            title={selectedHtmlFile.fileName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Nachrichtenbereich */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id}
            message={msg}
            sessionId={currentSessionId}
          />
        ))}
        
        {/* Ladeindikator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Eingabebereich */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer; 