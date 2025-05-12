import React, { useRef, useEffect } from 'react';
import { ChatMessage, Message } from './ChatMessage';

export interface ChatContainerProps {
  /**
   * List of messages to display
   */
  messages: Message[];
  /**
   * Optional session ID for file paths
   */
  sessionId?: string;
  /**
   * Whether the container is loading
   */
  isLoading?: boolean;
  /**
   * Custom loading message
   */
  loadingMessage?: string;
  /**
   * Custom empty state message
   */
  emptyMessage?: string;
  /**
   * Custom message renderer
   */
  renderMessage?: (message: Message, index: number) => React.ReactNode;
  /**
   * Custom HTML base URL
   */
  htmlBaseUrl?: string;
}

/**
 * ChatContainer component for displaying a list of messages
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  sessionId,
  isLoading = false,
  loadingMessage = "Loading conversation...",
  emptyMessage = "No messages yet. Start a conversation!",
  renderMessage,
  htmlBaseUrl
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{loadingMessage}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message: Message, index: number) => (
            <div key={message.id || index}>
              {renderMessage ? (
                renderMessage(message, index)
              ) : (
                <ChatMessage 
                  message={message} 
                  sessionId={sessionId} 
                  htmlBaseUrl={htmlBaseUrl} 
                />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}; 