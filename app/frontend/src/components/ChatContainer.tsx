import React, { useState, useRef, useEffect } from 'react';
import { askQuestion } from '@/lib/api';
import { ChatContainerProps } from '@/lib/types';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useSessionMessages } from '@/lib/hooks/useSessionMessages';

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  currentSessionId, 
  onSessionUpdate,
  selectedHtmlFile = null
}) => {
  const { messages, isLoading: isLoadingMessages, addLocalMessage, loadMessages } = useSessionMessages(currentSessionId);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scrolle zum Ende der Nachrichten, wenn neue Nachrichten hinzugefügt werden
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handler zum Senden von Nachrichten
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) {
      return;
    }
    
    // Zeige sofort die Benutzernachricht an, bevor der Server antwortet
    addLocalMessage(message, 'user');
    
    // Frontend-State für den Lade-Indikator setzen
    setIsProcessing(true);

    try {
      // Sende die Anfrage an den Server (die Benutzernachricht wird in der API-Funktion hinzugefügt)
      const response = await askQuestion(currentSessionId, message);
      
      // Aktualisiere die Session
      if (currentSessionId === response.updatedSession.id) {
        onSessionUpdate(response.updatedSession);
      }
      
      // Lade alle Nachrichten neu, um sicherzustellen, dass der State korrekt ist
      await loadMessages();
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
      
      // Füge eine Fehlermeldung lokal hinzu
      addLocalMessage(
        'Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.',
        'assistant'
      );
    } finally {
      setIsProcessing(false);
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
        {isProcessing && (
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
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoadingMessages || isProcessing} />
      </div>
    </div>
  );
};

export default ChatContainer; 