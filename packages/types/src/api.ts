import { DatasetType } from './common';

/**
 * API request and response types
 */

/**
 * Ask Request payload
 */
export interface AskRequest {
  session_id: string;
  question: string;
  dataset_type?: DatasetType;
  years?: number[];
}

/**
 * Ask Response payload
 */
export interface AskResponse {
  answer: string;
  output_folder: string;
  html_files: string[];
}

/**
 * Backend Session representation
 */
export interface BackendSession {
  id: string;
  user_id?: string;
  last_message?: string;
  timestamp?: string;
  html_files?: string[];
  output_folder?: string;
}

/**
 * Backend Message representation
 */
export interface BackendMessage {
  id: string;
  user_id?: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'assistant';
}

/**
 * Frontend Session representation
 */
export interface Session {
  id: string;
  userId?: string;
  lastMessage: string;
  timestamp: string;
  htmlFiles: string[];
  outputFolder?: string;
}

/**
 * Frontend Message representation
 */
export interface Message {
  id: string;
  userId?: string;
  content: string;
  sender: 'user' | 'assistant';
  htmlFiles?: string[];
  outputFolder?: string;
  timestamp?: string;
} 