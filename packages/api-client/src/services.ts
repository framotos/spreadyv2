'use client';

import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  AskRequest, 
  AskResponse, 
  Session, 
  BackendSession, 
  Message, 
  BackendMessage 
} from './types';

// Cache functionality
let sessionsCache: Session[] | null = null;
let sessionsCacheTime: number = 0;
const CACHE_EXPIRY_MS = 5000; // 5 seconds cache validity

// Cache invalidation
const invalidateCache = () => {
  sessionsCache = null;
};

export class ApiService {
  private client: AxiosInstance;
  
  constructor(apiClient: AxiosInstance) {
    this.client = apiClient;
  }

  /**
   * Updates or creates a session
   */
  async updateSession(
    sessionId: string, 
    htmlFiles: string[], 
    outputFolder: string,
    lastMessage: string
  ): Promise<Session> {
    try {
      const response = await this.client.put<BackendSession>(`/sessions/${sessionId}`, {
        html_files: htmlFiles,
        output_folder: outputFolder,
        last_message: lastMessage
      });
      
      const updatedSession: Session = {
        id: response.data.id,
        lastMessage: response.data.last_message || 'Neue Konversation',
        timestamp: response.data.timestamp || new Date().toISOString(),
        htmlFiles: response.data.html_files || [],
        outputFolder: response.data.output_folder || outputFolder
      };
      
      invalidateCache();
      return updatedSession;
    } catch (error: unknown) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Retrieves messages for a specific session
   */
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      const response = await this.client.get<Message[]>(`/sessions/${sessionId}/messages`);
      
      // Ensure response conforms to Message[] type
      const messages: Message[] = response.data.map((msg: any) => ({
        id: msg.id,
        userId: msg.userId,
        content: msg.content,
        sender: msg.sender,
        htmlFiles: msg.htmlFiles || [],
        outputFolder: msg.outputFolder,
        timestamp: msg.timestamp
      }));
      
      return messages;
    } catch (error: unknown) {
      console.error('Error retrieving session messages:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Axios error details:', axiosError.response?.data);
        throw new Error(
          (axiosError.response?.data as any)?.detail || 'Error retrieving messages'
        );
      } else {
        throw new Error('Unknown error retrieving messages');
      }
    }
  }

  /**
   * Asks a question to the backend agent for a specific session
   */
  async askQuestion(
    sessionId: string, 
    question: string
  ): Promise<AskResponse> {
    const payload: AskRequest = {
      session_id: sessionId,
      question,
    };
    
    try {
      const response = await this.client.post<AskResponse>('/ask', payload);
      return response.data;
    } catch (error: unknown) {
      console.error('Error calling /ask endpoint:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Axios error details:', axiosError.response?.data);
        throw new Error(
          (axiosError.response?.data as any)?.detail || 'Error querying the agent'
        );
      } else {
        throw new Error('Unknown error querying the agent');
      }
    }
  }

  /**
   * Retrieves all sessions for the current user
   */
  async getSessions(): Promise<Session[]> {
    // Cache check
    const now = Date.now();
    if (sessionsCache && now - sessionsCacheTime < CACHE_EXPIRY_MS) {
      return sessionsCache;
    }
    
    try {
      const response = await this.client.get<BackendSession[]>('/sessions');
      
      const transformedSessions = response.data.map((session: BackendSession) => ({
        id: session.id,
        userId: session.user_id,
        lastMessage: session.last_message || 'Neue Konversation',
        timestamp: session.timestamp || new Date().toISOString(),
        htmlFiles: session.html_files || [],
        outputFolder: session.output_folder
      }));
      
      sessionsCache = transformedSessions;
      sessionsCacheTime = now;
      
      return transformedSessions;
    } catch (error: unknown) {
      console.error('Error retrieving sessions:', error);
      throw error;
    }
  }

  /**
   * Creates a new session
   */
  async createSession(sessionId: string): Promise<Session> {
    try {
      const outputFolder = `user_question_output_${sessionId.substring(0, 4)}`;
      
      const updatedSession = await this.updateSession(
        sessionId,
        [],
        outputFolder,
        'Neue Konversation'
      );
      
      return updatedSession;
    } catch (error: unknown) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Adds a message to a session
   */
  async addMessage(
    sessionId: string, 
    content: string, 
    sender: 'user' | 'assistant'
  ): Promise<BackendMessage> {
    const payload = {
      content,
      sender,
    };
    
    try {
      const response = await this.client.post<BackendMessage>(
        `/sessions/${sessionId}/messages`,
        payload
      );
      
      return response.data;
    } catch (error: unknown) {
      console.error('Error adding message:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Axios error details:', axiosError.response?.data);
        throw new Error(
          (axiosError.response?.data as any)?.detail || 'Error adding message'
        );
      } else {
        throw new Error('Unknown error adding message');
      }
    }
  }
  
  /**
   * Health check function
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error: unknown) {
      console.error('Health check error:', error);
      throw error;
    }
  }
} 