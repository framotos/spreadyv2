import React from 'react';

export interface Session {
  id: string;
  title?: string;
  createdAt?: string;
  htmlFiles?: {
    name: string;
    outputFolder: string;
  }[];
}

export interface SidebarProps {
  /**
   * The currently selected session ID
   */
  currentSessionId?: string;
  /**
   * List of sessions to display
   */
  sessions: Session[];
  /**
   * Whether the sidebar is loading
   */
  isLoading?: boolean;
  /**
   * Callback when a session is selected
   */
  onSessionSelect: (sessionId: string) => void;
  /**
   * Callback when a new session is created
   */
  onCreateSession: () => void;
  /**
   * Callback when the user signs out
   */
  onSignOut?: () => void;
  /**
   * Callback when an HTML file is selected
   */
  onHtmlFileSelect?: (fileName: string, outputFolder: string, sessionId: string) => void;
  /**
   * Custom title for the sidebar
   */
  title?: string;
}

/**
 * Sidebar component for navigation
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentSessionId,
  sessions,
  isLoading = false,
  onSessionSelect,
  onCreateSession,
  onSignOut,
  onHtmlFileSelect,
  title = "Chats"
}) => {
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-gilroy font-bold">{title}</h2>
        <button 
          onClick={onCreateSession}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
          aria-label="Create new chat"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.3333V6.66667" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.66666 10H13.3333" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats available</div>
        ) : (
          <div>
            {sessions.map((session: Session) => (
              <div
                key={session.id}
                className={`p-3 border-b border-gray-200 cursor-pointer ${
                  session.id === currentSessionId ? 'bg-gray-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {session.title || `Chat ${session.id.slice(0, 6)}`}
                  </span>
                  {session.createdAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {/* HTML Files */}
                {onHtmlFileSelect && session.htmlFiles && session.htmlFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Files:</p>
                    <ul className="space-y-1">
                      {session.htmlFiles.map((file, index) => (
                        <li key={index}>
                          <button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              onHtmlFileSelect(file.name, file.outputFolder, session.id);
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {file.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {onSignOut && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onSignOut}
            className="w-full py-2 px-4 flex items-center justify-center space-x-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-8 1a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 100-2H7V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}; 