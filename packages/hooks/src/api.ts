import { Session } from './types';

/**
 * Get all sessions from the backend
 * @returns An array of sessions
 * @todo Replace with actual API implementation
 */
export const getSessions = async (): Promise<Session[]> => {
  // TODO: Replace with actual API implementation
  return [];
};

/**
 * Create a new session
 * @param sessionId The ID of the session to create
 * @returns The created session
 * @todo Replace with actual API implementation
 */
export const createSession = async (sessionId: string): Promise<Session> => {
  // TODO: Replace with actual API implementation
  return {
    id: sessionId,
    name: `Session ${sessionId.substring(0, 5)}`,
    lastMessage: 'New conversation',
    timestamp: new Date().toISOString(),
    htmlFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Update a session
 * @param session The session to update
 * @returns The updated session
 * @todo Replace with actual API implementation
 */
export const updateSession = async (session: Session): Promise<Session> => {
  // TODO: Replace with actual API implementation
  return {
    ...session,
    updatedAt: new Date().toISOString()
  };
}; 