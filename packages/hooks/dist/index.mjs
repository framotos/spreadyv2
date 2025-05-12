// src/useLocalStorage.ts
import { useState, useEffect } from "react";
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing localStorage change:", error);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key]);
  return [storedValue, setValue];
}

// src/useSessionManagement.ts
import { useState as useState2, useCallback, useEffect as useEffect2, useRef } from "react";

// src/utils.ts
function generateUUID() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}

// src/useSessionManagement.ts
function useSessionManagement() {
  const [currentSessionId, setCurrentSessionIdRaw] = useLocalStorage("currentSessionId", null);
  const [sessions, setSessions] = useState2([]);
  const [isLoading, setIsLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const [selectedFile, setSelectedFile] = useState2(null);
  const [messages, setMessages] = useState2([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState2(false);
  const initialized = useRef(false);
  const sessionsLoaded = useRef(false);
  const setCurrentSessionId = useCallback((id) => {
    setCurrentSessionIdRaw(id);
  }, [setCurrentSessionIdRaw]);
  const initializeSession = useCallback(() => {
    if (initialized.current)
      return currentSessionId;
    if (!currentSessionId && typeof window !== "undefined") {
      const newSessionId = generateUUID();
      setCurrentSessionId(newSessionId);
      initialized.current = true;
      return newSessionId;
    } else {
      initialized.current = true;
      return currentSessionId;
    }
  }, [currentSessionId, setCurrentSessionId]);
  const loadSessions = useCallback(async () => {
    if (sessionsLoaded.current)
      return sessions;
    try {
      setIsLoading(true);
      setError(null);
      const loadedSessions = [];
      setSessions(loadedSessions);
      sessionsLoaded.current = true;
      setIsLoading(false);
      return loadedSessions;
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Failed to load sessions");
      setIsLoading(false);
      return [];
    }
  }, [sessions]);
  const createSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sessionId = generateUUID();
      const newSession = {
        id: sessionId,
        lastMessage: "New conversation",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        htmlFiles: []
      };
      setSessions((prev) => [...prev, newSession]);
      setCurrentSessionId(sessionId);
      setIsLoading(false);
      return sessionId;
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create session");
      setIsLoading(false);
      return null;
    }
  }, [setCurrentSessionId]);
  const updateSession = useCallback((updatedSession) => {
    if (!updatedSession)
      return;
    setSessions((prevSessions) => {
      const index = prevSessions.findIndex((s) => s.id === updatedSession.id);
      if (index === -1) {
        return [updatedSession, ...prevSessions];
      } else {
        const updatedSessions = [...prevSessions];
        updatedSessions[index] = updatedSession;
        return updatedSessions;
      }
    });
  }, []);
  const loadMessages = useCallback(async (sessionId) => {
    if (!sessionId)
      return [];
    try {
      setIsLoadingMessages(true);
      const loadedMessages = [];
      setMessages(loadedMessages);
      setIsLoadingMessages(false);
      return loadedMessages;
    } catch (err) {
      console.error("Error loading messages:", err);
      setIsLoadingMessages(false);
      return [];
    }
  }, []);
  const addMessage = useCallback(async (content, sender) => {
    if (!currentSessionId)
      return null;
    try {
      const newMessage = {
        id: generateUUID(),
        content,
        sender,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error("Error adding message:", err);
      return null;
    }
  }, [currentSessionId]);
  const selectFile = useCallback((fileName, outputFolder, sessionId) => {
    setSelectedFile({ fileName, outputFolder, sessionId });
  }, []);
  const resetSelection = useCallback(() => {
    setSelectedFile(null);
  }, []);
  const handleSessionSelect = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
    resetSelection();
    loadMessages(sessionId);
  }, [setCurrentSessionId, resetSelection, loadMessages]);
  const handleHtmlFileSelect = useCallback((fileName, outputFolder, sessionId) => {
    setCurrentSessionId(sessionId);
    selectFile(fileName, outputFolder, sessionId);
  }, [setCurrentSessionId, selectFile]);
  useEffect2(() => {
    if (typeof window !== "undefined" && !initialized.current) {
      initializeSession();
    }
  }, [initializeSession]);
  useEffect2(() => {
    if (typeof window !== "undefined" && !sessionsLoaded.current) {
      loadSessions();
    }
  }, [loadSessions]);
  useEffect2(() => {
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
export {
  generateUUID,
  useLocalStorage,
  useSessionManagement
};
