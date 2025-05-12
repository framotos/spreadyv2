// Re-export types from the types package
import type { Session, Message } from '@neurofinance/types';

export type { Session, Message };

// Define local types
export interface HtmlFile {
  fileName: string;
  outputFolder: string;
  sessionId: string;
}

export interface ChatContainerProps {
  currentSessionId: string;
  onSessionUpdate?: (session?: Session) => void;
  selectedHtmlFile?: HtmlFile | null;
}

export interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onHtmlFileSelect: (fileName: string, outputFolder: string, sessionId: string) => void;
  sessions: Session[];
  isLoading: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
} 