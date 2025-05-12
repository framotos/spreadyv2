import React, { useState, FormEvent } from 'react';
import { Button } from './Button';

export interface ChatInputProps {
  /**
   * Callback when message is sent
   */
  onSendMessage: (message: string) => void;
  /**
   * Whether the input is in loading state
   */
  isLoading?: boolean;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Button text
   */
  buttonText?: string;
}

/**
 * ChatInput component for sending messages
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  buttonText = "Send"
}) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-1 items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border px-3 py-2 rounded-d"
          disabled={isLoading}
        />
        <Button 
          type="submit"
          className="ml-2 px-4 py-2 bg-h1-new text-white rounded-d hover:bg-h1-light"
          disabled={!message.trim() || isLoading}
          isLoading={isLoading}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
}; 