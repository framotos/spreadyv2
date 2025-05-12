import React from 'react';

export interface NavbarItemSession {
  id: string;
  title?: string;
  createdAt?: string;
  htmlFiles?: string[];
  outputFolder?: string;
}

export interface NavbarItemProps {
  /**
   * The session object
   */
  session: NavbarItemSession;
  /**
   * Whether this item is active
   */
  isActive?: boolean;
  /**
   * Callback when the item is clicked
   */
  onClick: () => void;
  /**
   * Callback when an HTML file is selected
   */
  onHtmlFileSelect?: (fileName: string, outputFolder: string, sessionId: string) => void;
}

/**
 * NavbarItem component for sidebar navigation
 */
export const NavbarItem: React.FC<NavbarItemProps> = ({
  session,
  isActive = false,
  onClick,
  onHtmlFileSelect
}) => {
  // Format the date to display only the date part
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return '';
    }
  };

  // Check if this session has HTML files
  const hasHtmlFiles = session.htmlFiles && 
    session.htmlFiles.length > 0 && 
    session.outputFolder;

  return (
    <div 
      className={`p-3 border-b border-gray-200 cursor-pointer ${
        isActive ? 'bg-gray-200' : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium truncate">
          {session.title || `Chat ${session.id.slice(0, 6)}`}
        </span>
        {session.createdAt && (
          <span className="text-xs text-gray-500">
            {formatDate(session.createdAt)}
          </span>
        )}
      </div>
      
      {/* HTML Files */}
      {hasHtmlFiles && onHtmlFileSelect && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Files:</p>
          <ul className="space-y-1">
            {session.htmlFiles!.map((file: string, index: number) => (
              <li key={index}>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onHtmlFileSelect(file, session.outputFolder!, session.id);
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {file}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 