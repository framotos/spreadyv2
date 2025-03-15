export type DatasetType = 'income' | 'balance' | null;

// API-Anfrage- und Antworttypen
export interface AskRequest {
  session_id: string;
  question: string;
  dataset_type?: DatasetType;
  years?: number[];
}

export interface AskResponse {
  answer: string;
  output_folder: string;
  html_files: string[];
}

// Backend-Datentypen
export interface BackendSession {
  id: string;
  last_message?: string;
  timestamp?: string;
  html_files?: string[];
}

export interface BackendMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'assistant';
}

// Frontend-Datentypen
export interface Session {
  id: string;
  lastMessage: string;
  timestamp: string;
  htmlFiles: string[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  htmlFiles?: string[];
}

// Legacy-Typen (für Kompatibilität mit bestehendem Code)
export interface LegacyMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  visualizations?: string[];
}

export interface ChatSession {
  id: string;
  messages: LegacyMessage[];
  datasetType: DatasetType;
  selectedYears: number[];
}

// Komponenten-Props
export interface ChatContainerProps {
  currentSessionId: string;
  onSessionUpdate: () => void;
}

export interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

export interface NavbarItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
}

export interface ChatInputProps {
  onSendMessage: (message: string, datasetType: DatasetType, years: number[]) => void;
  isLoading: boolean;
}

export interface ToggleButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
} 