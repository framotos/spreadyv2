import React, { useState } from 'react';
import { NavbarItemProps } from '@/lib/types';

const NavbarItem: React.FC<NavbarItemProps> = ({ session, isActive, onClick }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Formatiert das Datum für die Anzeige
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  // Kürzt den Text auf eine bestimmte Länge
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Wechselt den Zustand zwischen erweitert und nicht erweitert
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className={`p-4 cursor-pointer hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {truncateText(session.lastMessage, 30)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(session.timestamp)}
            </p>
          </div>
          {session.htmlFiles.length > 0 && (
            <button 
              onClick={toggleExpand}
              className="ml-2 p-1 rounded-full hover:bg-gray-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Unterelemente für HTML-Dateien */}
      {isExpanded && session.htmlFiles.length > 0 && (
        <div className="bg-gray-50 pl-8 pr-4 py-2">
          <ul className="space-y-1">
            {session.htmlFiles.map((file, index) => (
              <li key={index} className="text-xs">
                <a 
                  href={`/api/files/${session.id}/${file}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {file}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavbarItem; 