'use client';

import React, { useState, useEffect } from 'react';
import ChatContainer from '@/components/ChatContainer';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Beim ersten Laden eine neue Sitzung erstellen oder die letzte Sitzung aus dem lokalen Speicher laden
  useEffect(() => {
    // TODO: BACKEND-INTEGRATION - Hier sollte geprüft werden, ob eine gespeicherte Session
    // tatsächlich im Backend existiert, bevor sie verwendet wird.
    // Beispiel: const isValidSession = await checkSession(savedSessionId);
    
    const savedSessionId = localStorage.getItem('currentSessionId');
    if (savedSessionId) {
      setCurrentSessionId(savedSessionId);
    } else {
      // Erstelle eine neue Sitzung
      const newSessionId = crypto.randomUUID();
      setCurrentSessionId(newSessionId);
      localStorage.setItem('currentSessionId', newSessionId);
    }
  }, []);

  // Aktualisiere den lokalen Speicher, wenn sich die aktuelle Sitzung ändert
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('currentSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  // Handler für die Auswahl einer Sitzung
  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };
  
  // TODO: BACKEND-INTEGRATION - Diese Funktion sollte implementiert werden, um
  // die Sitzung im Backend zu aktualisieren, wenn neue Nachrichten hinzugefügt werden.
  const handleSessionUpdate = () => {
    // Beispiel: await updateSession(currentSessionId, { ... });
    console.log('Session aktualisiert:', currentSessionId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentSessionId={currentSessionId} 
        onSessionSelect={handleSessionSelect} 
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
                onSessionUpdate={handleSessionUpdate}
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
