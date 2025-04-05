'use client';

import React, { useState } from 'react';
// TODO: BACKEND-INTEGRATION - Der Import von NavbarItem verursacht einen Linter-Fehler.
// Dies könnte an einem Pfadproblem oder einer fehlenden Datei liegen.
// Für die Produktion sollte dieser Fehler behoben werden.
import NavbarItem from '@/components/NavbarItem';
import { createSession } from '@/lib/authenticatedApi';
import { SidebarProps } from '@/lib/types';
import { generateUUID } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSessionId, 
  onSessionSelect,
  onHtmlFileSelect,
  sessions,
  isLoading
}) => {
  const [error, setError] = useState<string | null>(null);
  const { signOut } = useAuth();

  const createNewChat = async () => {
    // TODO: BACKEND-INTEGRATION - Diese Funktion verwendet jetzt createSession(),
    // die aktuell eine lokale Sitzung erstellt. Sobald das Backend implementiert ist,
    // sollte die Funktion angepasst werden, um mit dem tatsächlichen Backend-Endpunkt zu arbeiten.
    try {
      // Erstellt eine neue Sitzung und wechselt zu ihr
      const newSessionId = generateUUID();
      
      // Erstelle eine neue Session über die API
      await createSession(newSessionId);
      
      // Wechsle zur neuen Session
      onSessionSelect(newSessionId);
      
      // Wir rufen onNewSession nicht auf, da die Session bereits in mockSessionsData hinzugefügt wurde
      // und beim nächsten Laden der Sessions automatisch erscheinen wird.
      // Dies verhindert doppelte Einträge in der Seitenleiste.
    } catch (err) {
      console.error('Fehler beim Erstellen eines neuen Chats:', err);
      setError('Neuer Chat konnte nicht erstellt werden');
    }
  };

  // Handler für die Auswahl einer HTML-Datei
  const handleHtmlFileSelect = (fileName: string, outputFolder: string, sessionId: string) => {
    onHtmlFileSelect(fileName, outputFolder, sessionId);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-gilroy font-bold">Chats</h2>
        <button 
          onClick={createNewChat}
          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
        >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13.3333V6.66667" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.66666 10H13.3333" stroke="#323232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Heute</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Lädt...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Keine Chats vorhanden</div>
        ) : (
          <div>
            {sessions.map((session) => (
              <NavbarItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                onHtmlFileSelect={handleHtmlFileSelect}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleSignOut}
          className="w-full py-2 px-4 flex items-center justify-center space-x-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-8 1a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 100-2H7V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Abmelden</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 