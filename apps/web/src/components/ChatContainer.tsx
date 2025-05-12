'use client';

import React, { useState, useEffect } from 'react';
import { Message } from '@neurofinance/types';
import { ChatInput, ChatContainer as UIChatContainer } from '@neurofinance/ui';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { useAuth } from '@neurofinance/auth';
import type { ChatContainerProps } from '@/lib/types';

/**
 * Application-specific ChatContainer that uses the reusable ChatContainer component
 */
const ChatContainer: React.FC<ChatContainerProps> = ({ 
  currentSessionId, 
  onSessionUpdate,
  selectedHtmlFile 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { apiService } = useApiClient();
  const { session } = useAuth();

  // Load messages when session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentSessionId || !apiService) return;
      
      try {
        const fetchedMessages = await apiService.getSessionMessages(currentSessionId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    
    fetchMessages();
  }, [currentSessionId, apiService]);

  // Send message
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentSessionId || !apiService) return;
    
    // Optimistic UI update
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Add user message to the session
      await apiService.addMessage(currentSessionId, message, 'user');
      
      // Send request to backend
      const response = await apiService.askQuestion(currentSessionId, message);
      
      // Add response as new message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.answer,
        sender: 'assistant',
        htmlFiles: response.html_files,
        outputFolder: response.output_folder
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update session with new HTML files
      if (onSessionUpdate) {
        onSessionUpdate({
          id: currentSessionId,
          lastMessage: message,
          timestamp: new Date().toISOString(),
          htmlFiles: response.html_files,
          outputFolder: response.output_folder
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Error handling here...
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main chat area */}
      <UIChatContainer
        messages={messages}
        isLoading={isLoading}
        loadingMessage="Loading..."
        emptyMessage="No messages in this session. Start a conversation!"
        htmlBaseUrl="/user_output"
      />
      
      {/* HTML visualization */}
      {selectedHtmlFile && (
        <div className="flex-1 border-t border-gray-200">
          <div id="iframe-container" className="w-full h-full">
            <iframe 
              src={`/user_output/${selectedHtmlFile.outputFolder}/${selectedHtmlFile.fileName}`}
              className="w-full h-full border-0"
              title={selectedHtmlFile.fileName}
            />
          </div>
        </div>
      )}
      
      {/* Input field */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatContainer; 