import React, { useState } from 'react';

export interface Message {
  id?: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp?: string;
  htmlFiles?: string[];
  outputFolder?: string;
}

export interface ChatMessageProps {
  /**
   * The message to display
   */
  message: Message;
  /**
   * Optional session ID for file paths
   */
  sessionId?: string;
  /**
   * Custom base URL for HTML files
   */
  htmlBaseUrl?: string;
}

/**
 * ChatMessage component for displaying user and assistant messages
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  sessionId,
  htmlBaseUrl = '/user_output'
}) => {
  const isUser = message.sender === 'user';
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<string | null>(null);
  
  // Function to display an HTML file
  const handleViewHtml = (file: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedHtmlFile(file);
  };
  
  // Function to close the HTML display
  const handleCloseHtml = () => {
    setSelectedHtmlFile(null);
  };
  
  // Get the URL for an HTML file
  const getHtmlUrl = (file: string) => {
    if (message.outputFolder) {
      return `${htmlBaseUrl}/${message.outputFolder}/${file}`;
    } else if (sessionId) {
      return `/api/files/${sessionId}/${file}`;
    } else {
      return `/api/files/unknown/${file}`;
    }
  };
  
  // Check if this message has HTML files
  const hasHtmlFiles = message.sender === 'assistant' && 
    message.htmlFiles && 
    message.htmlFiles.length > 0 && 
    message.outputFolder;
  
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
        
        {/* Display HTML files if this message has them */}
        {hasHtmlFiles && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium mb-1">Generated Graphics:</p>
            <ul className="space-y-1">
              {message.htmlFiles!.map((file: string, index: number) => (
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
        
        {/* HTML file display */}
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