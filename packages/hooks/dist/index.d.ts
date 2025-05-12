import * as react from 'react';
import * as _neurofinance_types from '@neurofinance/types';
import { Session as Session$1 } from '@neurofinance/types';

/**
 * Custom hook for persistent state with localStorage
 *
 * @param key The localStorage key to store the value under
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it that persists to localStorage
 */
declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void];

/**
 * Shared types for hooks
 */

interface Session extends Session$1 {
    name?: string;
    createdAt?: string;
    updatedAt?: string;
}
interface HtmlFile {
    fileName: string;
    outputFolder: string;
    sessionId: string;
}

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
declare function useSessionManagement(): {
    currentSessionId: string | null;
    sessions: Session[];
    isLoading: boolean;
    error: string | null;
    messages: _neurofinance_types.Message[];
    isLoadingMessages: boolean;
    selectedFile: HtmlFile | null;
    setCurrentSessionId: (id: string | null) => void;
    createSession: () => Promise<string | null>;
    updateSession: (updatedSession?: Session) => void;
    loadSessions: () => Promise<Session[]>;
    addMessage: (content: string, sender: "user" | "assistant") => Promise<_neurofinance_types.Message | null>;
    selectFile: (fileName: string, outputFolder: string, sessionId: string) => void;
    resetSelection: () => void;
    handleSessionSelect: (sessionId: string) => void;
    handleHtmlFileSelect: (fileName: string, outputFolder: string, sessionId: string) => void;
    setError: react.Dispatch<react.SetStateAction<string | null>>;
    clearError: () => void;
};

/**
 * Utility functions for the hooks package
 */
/**
 * Generate a random UUID
 * @returns A random UUID string
 */
declare function generateUUID(): string;

export { generateUUID, useLocalStorage, useSessionManagement };
