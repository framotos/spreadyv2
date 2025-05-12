'use client';

import React, { useState } from 'react';
import { Sidebar as UISidebar } from '@neurofinance/ui';
import { Session } from '@neurofinance/types';
import { generateUUID } from '@/lib/utils';
import { useAuth } from '@neurofinance/auth';
import { useApiClient } from '@/lib/hooks/useApiClient';
import type { SidebarProps } from '@/lib/types';

/**
 * Application-specific Sidebar that uses the reusable Sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ 
  currentSessionId, 
  onSessionSelect,
  onHtmlFileSelect,
  sessions,
  isLoading
}) => {
  const [error, setError] = useState<string | null>(null);
  const { signOut, session: authSession } = useAuth();
  const { apiService } = useApiClient();

  // Create a new chat session
  const handleCreateSession = async () => {
    if (!authSession) {
      setError('You must be logged in to create a new chat');
      return;
    }
    
    if (!apiService) {
      setError('API service not available');
      return;
    }
    
    try {
      const newSessionId = generateUUID();
      await apiService.createSession(newSessionId);
      onSessionSelect(newSessionId);
    } catch (err) {
      console.error('Error creating new chat:', err);
      setError('Could not create new chat');
    }
  };

  // Transform sessions to the format expected by UISidebar
  const transformedSessions = sessions.map((session: Session) => ({
    id: session.id,
    title: session.lastMessage || 'New Conversation',
    createdAt: session.timestamp,
    htmlFiles: session.htmlFiles?.map((file: string) => ({
      name: file,
      outputFolder: session.outputFolder || ''
    }))
  }));

  return (
    <>
      {error && (
        <div className="p-4 text-center text-red-500 absolute top-0 left-0 right-0 z-10 bg-white">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <UISidebar
        currentSessionId={currentSessionId || undefined}
        sessions={transformedSessions}
        isLoading={isLoading}
        onSessionSelect={onSessionSelect}
        onCreateSession={handleCreateSession}
        onSignOut={signOut}
        onHtmlFileSelect={onHtmlFileSelect}
        title="Chats"
      />
    </>
  );
};

export default Sidebar; 