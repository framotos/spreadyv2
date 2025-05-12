import React, { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button variant
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    /**
     * Button size
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Is the button in a loading state?
     */
    isLoading?: boolean;
}
/**
 * Primary UI component for user interaction
 */
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Card variant
     */
    variant?: 'default' | 'bordered' | 'elevated';
    /**
     * Card padding
     */
    padding?: 'none' | 'sm' | 'md' | 'lg';
}
/**
 * Card component for content containers
 */
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /**
     * Label for the input
     */
    label?: string;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * Helper text to display
     */
    helperText?: string;
}
/**
 * Input component for forms
 */
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

interface Message {
    id?: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp?: string;
    htmlFiles?: string[];
    outputFolder?: string;
}
interface ChatMessageProps {
    /**
     * The message to display
     */
    message: Message;
    /**
     * Optional session ID for file paths
     */
    sessionId?: string;
    /**
     * Custom base URL for HTML files
     */
    htmlBaseUrl?: string;
}
/**
 * ChatMessage component for displaying user and assistant messages
 */
declare const ChatMessage: React.FC<ChatMessageProps>;

interface ChatInputProps {
    /**
     * Callback when message is sent
     */
    onSendMessage: (message: string) => void;
    /**
     * Whether the input is in loading state
     */
    isLoading?: boolean;
    /**
     * Placeholder text for the input
     */
    placeholder?: string;
    /**
     * Button text
     */
    buttonText?: string;
}
/**
 * ChatInput component for sending messages
 */
declare const ChatInput: React.FC<ChatInputProps>;

interface Session {
    id: string;
    title?: string;
    createdAt?: string;
    htmlFiles?: {
        name: string;
        outputFolder: string;
    }[];
}
interface SidebarProps {
    /**
     * The currently selected session ID
     */
    currentSessionId?: string;
    /**
     * List of sessions to display
     */
    sessions: Session[];
    /**
     * Whether the sidebar is loading
     */
    isLoading?: boolean;
    /**
     * Callback when a session is selected
     */
    onSessionSelect: (sessionId: string) => void;
    /**
     * Callback when a new session is created
     */
    onCreateSession: () => void;
    /**
     * Callback when the user signs out
     */
    onSignOut?: () => void;
    /**
     * Callback when an HTML file is selected
     */
    onHtmlFileSelect?: (fileName: string, outputFolder: string, sessionId: string) => void;
    /**
     * Custom title for the sidebar
     */
    title?: string;
}
/**
 * Sidebar component for navigation
 */
declare const Sidebar: React.FC<SidebarProps>;

interface NavbarItemSession {
    id: string;
    title?: string;
    createdAt?: string;
    htmlFiles?: string[];
    outputFolder?: string;
}
interface NavbarItemProps {
    /**
     * The session object
     */
    session: NavbarItemSession;
    /**
     * Whether this item is active
     */
    isActive?: boolean;
    /**
     * Callback when the item is clicked
     */
    onClick: () => void;
    /**
     * Callback when an HTML file is selected
     */
    onHtmlFileSelect?: (fileName: string, outputFolder: string, sessionId: string) => void;
}
/**
 * NavbarItem component for sidebar navigation
 */
declare const NavbarItem: React.FC<NavbarItemProps>;

interface ChatContainerProps {
    /**
     * List of messages to display
     */
    messages: Message[];
    /**
     * Optional session ID for file paths
     */
    sessionId?: string;
    /**
     * Whether the container is loading
     */
    isLoading?: boolean;
    /**
     * Custom loading message
     */
    loadingMessage?: string;
    /**
     * Custom empty state message
     */
    emptyMessage?: string;
    /**
     * Custom message renderer
     */
    renderMessage?: (message: Message, index: number) => React.ReactNode;
    /**
     * Custom HTML base URL
     */
    htmlBaseUrl?: string;
}
/**
 * ChatContainer component for displaying a list of messages
 */
declare const ChatContainer: React.FC<ChatContainerProps>;

export { Button, type ButtonProps, Card, type CardProps, ChatContainer, type ChatContainerProps, ChatInput, type ChatInputProps, ChatMessage, type ChatMessageProps, Input, type InputProps, type Message, NavbarItem, type NavbarItemProps, type NavbarItemSession, type Session, Sidebar, type SidebarProps };
