import React, { useState } from 'react';
import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
  sessionId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sessionId }) => {
  const isUser = message.sender === 'user';
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<string | null>(null);
  
  // Funktion zum Anzeigen einer HTML-Datei
  const handleViewHtml = (file: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedHtmlFile(file);
  };
  
  // Funktion zum Schließen der HTML-Anzeige
  const handleCloseHtml = () => {
    setSelectedHtmlFile(null);
  };
  
  // Fallback für den Fall, dass outputFolder nicht gesetzt ist
  const getHtmlUrl = (file: string) => {
    if (message.outputFolder) {
      return `http://localhost:8000/user_output/${message.outputFolder}/${file}`;
    } else {
      // Fallback auf die alte URL-Struktur
      return `/api/files/${sessionId}/${file}`;
    }
  };
  
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
                  <button 
                    onClick={(e) => handleViewHtml(file, e)}
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    {file}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* HTML-Datei-Anzeige */}
        {selectedHtmlFile && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <div className="bg-gray-200 p-2 flex justify-between items-center">
              <span className="text-sm font-medium">{selectedHtmlFile}</span>
              <button 
                onClick={handleCloseHtml}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="bg-white p-0 h-96">
              <iframe 
                src={getHtmlUrl(selectedHtmlFile)}
                className="w-full h-full border-0"
                title={selectedHtmlFile}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 