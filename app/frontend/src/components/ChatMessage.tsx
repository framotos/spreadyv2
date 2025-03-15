import React from 'react';
import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
  sessionId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sessionId }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-3/4 p-3 rounded-lg ${
          isUser 
            ? 'bg-teal-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        {/* HTML-Dateien anzeigen, falls vorhanden */}
        {message.htmlFiles && message.htmlFiles.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium mb-1">Generierte Grafiken:</p>
            <ul className="space-y-1">
              {message.htmlFiles.map((file, index) => (
                <li key={index}>
                  <a 
                    href={`/api/files/${sessionId}/${file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 