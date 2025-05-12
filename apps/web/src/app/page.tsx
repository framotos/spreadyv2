'use client';

import React from 'react';
import ChatContainer from '@/components/ChatContainer';
import Sidebar from '@/components/Sidebar';
import { useSessionManagement } from '@neurofinance/hooks';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Home() {
  // Use the consolidated session management hook
  const { 
    currentSessionId, 
    selectedFile, 
    sessions,
    isLoading,
    handleSessionSelect,
    handleHtmlFileSelect,
    updateSession
  } = useSessionManagement();

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          currentSessionId={currentSessionId} 
          onSessionSelect={handleSessionSelect}
          onHtmlFileSelect={handleHtmlFileSelect}
          sessions={sessions}
          isLoading={isLoading}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white p-4 shadow-sm">
            <div className="w-full h-7 flex items-center">
              <h1 className="text-lg font-gilroy font-semibold">Spready v1</h1>
            </div>
          </header>
          
          <main className="flex-1 p-4 overflow-auto">
            <div className="w-full h-full">
              {currentSessionId ? (
                <ChatContainer 
                  currentSessionId={currentSessionId}
                  onSessionUpdate={updateSession}
                  selectedHtmlFile={selectedFile}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
