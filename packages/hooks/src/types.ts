/**
 * Shared types for hooks
 */

// Import types from the types package
import type { Session as NeuroSession, Message as NeuroMessage } from '@neurofinance/types';

// Extend the Session type with additional properties
export interface Session extends NeuroSession {
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Message = NeuroMessage;

// Define local types
export interface HtmlFile {
  fileName: string;
  outputFolder: string;
  sessionId: string;
}

export type DatasetType = 'income' | 'balance' | null; 