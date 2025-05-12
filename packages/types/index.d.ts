/**
 * Centralized type definitions for the NeuroFinance application
 */

// Common types
export interface DatasetType {
  id: string;
  name: string;
  description: string;
}

// API types
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

export interface Session {
  id: string;
  userId?: string;
  lastMessage: string;
  timestamp: string;
  htmlFiles: string[];
  outputFolder?: string;
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

// Component types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

// Add any other types that need to be exported 