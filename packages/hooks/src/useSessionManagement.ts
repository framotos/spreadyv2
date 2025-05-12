import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Session, Message, HtmlFile } from './types';
import { generateUUID } from './utils';

/**
 * Comprehensive hook for session management
 * 
 * This hook consolidates functionality from:
 * - useSessionStorage
 * - useSession
 * - useSessionData
 * - useSessionMessages
 * - useHtmlFileSelection
 * 
 * @returns All session-related state and functions
 */
export function useSessionManagement() {
  // Session ID management with localStorage persistence
  const [currentSessionId, setCurrentSessionIdRaw] = useLocalStorage<string | null>('currentSessionId', null);
  
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // HTML file selection state
  const [selectedFile, setSelectedFile] = useState<HtmlFile | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  
  // Initialization flags
  const initialized = useRef(false);
  const sessionsLoaded = useRef(false);

  // Set session ID with validation
  const setCurrentSessionId = useCallback((id: string | null) => {
    setCurrentSessionIdRaw(id);
  }, [setCurrentSessionIdRaw]);

  // Initialize session on first render
  const initializeSession = useCallback(() => {
    if (initialized.current) return currentSessionId;
    
    if (!currentSessionId && typeof window !== 'undefined') {
      const newSessionId = generateUUID();
      setCurrentSessionId(newSessionId);
      initialized.current = true;
      return newSessionId;
    } else {
      initialized.current = true;
      return currentSessionId;
    }
  }, [currentSessionId, setCurrentSessionId]);

  // Load sessions from API
  const loadSessions = useCallback(async () => {
    if (sessionsLoaded.current) return sessions;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      // Simulated API response
      const loadedSessions: Session[] = [];
      
      setSessions(loadedSessions);
      sessionsLoaded.current = true;
      setIsLoading(false);
      return loadedSessions;
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
      setIsLoading(false);
      return [];
    }
  }, [sessions]);

  // Create a new session
  const createSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = generateUUID();
      
      // TODO: Replace with actual API call
      // Simulated API response
      const newSession: Session = {
        id: sessionId,
        lastMessage: 'New conversation',
        timestamp: new Date().toISOString(),
        htmlFiles: []
      };
      
      setSessions(prev => [...prev, newSession]);
      setCurrentSessionId(sessionId);
      setIsLoading(false);
      
      return sessionId;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
      setIsLoading(false);
      return null;
    }
  }, [setCurrentSessionId]);

  // Update a session
  const updateSession = useCallback((updatedSession?: Session) => {
    if (!updatedSession) return;
    
    setSessions(prevSessions => {
      const index = prevSessions.findIndex(s => s.id === updatedSession.id);
      if (index === -1) {
        // Add new session
        return [updatedSession, ...prevSessions];
      } else {
        // Update existing session
        const updatedSessions = [...prevSessions];
        updatedSessions[index] = updatedSession;
        return updatedSessions;
      }
    });
  }, []);

  // Load messages for the current session
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return [];
    
    try {
      setIsLoadingMessages(true);
      
      // TODO: Replace with actual API call
      // Simulated API response
      const loadedMessages: Message[] = [];
      
      setMessages(loadedMessages);
      setIsLoadingMessages(false);
      return loadedMessages;
    } catch (err) {
      console.error('Error loading messages:', err);
      setIsLoadingMessages(false);
      return [];
    }
  }, []);

  // Add a message to the current session
  const addMessage = useCallback(async (content: string, sender: 'user' | 'assistant') => {
    if (!currentSessionId) return null;
    
    try {
      // TODO: Replace with actual API call
      // Simulated API response
      const newMessage: Message = {
        id: generateUUID(),
        content,
        sender,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Error adding message:', err);
      return null;
    }
  }, [currentSessionId]);

  // HTML file selection functions
  const selectFile = useCallback((fileName: string, outputFolder: string, sessionId: string) => {
    setSelectedFile({ fileName, outputFolder, sessionId });
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedFile(null);
  }, []);

  // Session selection handler
  const handleSessionSelect = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    resetSelection();
    loadMessages(sessionId);
  }, [setCurrentSessionId, resetSelection, loadMessages]);

  // HTML file selection handler
  const handleHtmlFileSelect = useCallback((fileName: string, outputFolder: string, sessionId: string) => {
    setCurrentSessionId(sessionId);
    selectFile(fileName, outputFolder, sessionId);
  }, [setCurrentSessionId, selectFile]);

  // Initialize on first render
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized.current) {
      initializeSession();
    }
  }, [initializeSession]);

  // Load sessions on first render
  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionsLoaded.current) {
      loadSessions();
    }
  }, [loadSessions]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, loadMessages]);

  return {
    // Session state
    currentSessionId,
    sessions,
    isLoading,
    error,
    
    // Message state
    messages,
    isLoadingMessages,
    
    // HTML file selection
    selectedFile,
    
    // Session actions
    setCurrentSessionId,
    createSession,
    updateSession,
    loadSessions,
    
    // Message actions
    addMessage,
    
    // HTML file actions
    selectFile,
    resetSelection,
    
    // Convenience handlers
    handleSessionSelect,
    handleHtmlFileSelect,
    
    // Error handling
    setError,
    clearError: () => setError(null)
  };
} 