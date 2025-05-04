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
  user_id?: string;
  last_message?: string;
  timestamp?: string;
  html_files?: string[];
  output_folder?: string;
}

export interface BackendMessage {
  id: string;
  user_id?: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'assistant';
}

// Frontend-Datentypen
export interface Session {
  id: string;
  userId?: string;
  lastMessage: string;
  timestamp: string;
  htmlFiles: string[];
  outputFolder?: string;
}

export interface HtmlFile {
  fileName: string;
  outputFolder: string;
}

export interface Message {
  id: string;
  userId?: string;
  content: string;
  sender: 'user' | 'assistant';
  htmlFiles?: string[];
  outputFolder?: string;
  timestamp?: string;
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
  onSessionUpdate: (updatedSession?: Session) => void;
  selectedHtmlFile?: HtmlFile | null;
}

export interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onHtmlFileSelect: (fileName: string, outputFolder: string, sessionId: string) => void;
  sessions: Session[];
  isLoading: boolean;
}

export interface NavbarItemProps {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onHtmlFileSelect: (fileName: string, outputFolder: string, sessionId: string) => void;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
} 