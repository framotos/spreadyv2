/**
 * Common type definitions shared across the application
 */

/**
 * HTML file representation
 */
export interface HtmlFile {
  fileName: string;
  outputFolder: string;
}

/**
 * Dataset types supported by the application
 */
export type DatasetType = 'income' | 'balance' | null;

/**
 * Component Props for the ChatInput component
 */
export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
} 