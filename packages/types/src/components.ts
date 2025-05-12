import { Session } from './api';
import { HtmlFile } from './common';

/**
 * Component Props types
 */

/**
 * Props for the ChatContainer component
 */
export interface ChatContainerProps {
  currentSessionId: string;
  onSessionUpdate: (updatedSession?: Session) => void;
  selectedHtmlFile?: HtmlFile | null;
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onHtmlFileSelect: (fileName: string, outputFolder: string, sessionId: string) => void;
  sessions: Session[];
  isLoading: boolean;
} 