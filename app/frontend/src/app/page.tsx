'use client';

import React from 'react';
import ChatContainer from '@/components/ChatContainer';
import Sidebar from '@/components/Sidebar';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { useHtmlFileSelection } from '@/lib/hooks/useHtmlFileSelection';

export default function Home() {
  // Verwende die modularen Hooks für verschiedene Aspekte der Anwendung
  // useSessionStorage übernimmt bereits die Initialisierung im internen useEffect
  const { currentSessionId, setCurrentSessionId } = useSessionStorage();
  const { sessions, isLoading, updateSession } = useSessionData(currentSessionId);
  const { selectedFile, selectFile, resetSelection } = useHtmlFileSelection();

  // Handler für die Auswahl einer Sitzung
  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    resetSelection(); // Zurücksetzen der HTML-Dateiauswahl bei Sitzungswechsel
  };
  
  // Handler für die Auswahl einer HTML-Datei
  const handleHtmlFileSelect = (fileName: string, outputFolder: string, sessionId: string) => {
    setCurrentSessionId(sessionId);
    selectFile(fileName, outputFolder);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentSessionId={currentSessionId} 
        onSessionSelect={handleSessionSelect}
        onHtmlFileSelect={handleHtmlFileSelect}
        sessions={sessions}
        isLoading={isLoading}
      />

      {/* Hauptinhalt */}
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
                <p className="text-gray-500">Lädt...</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
