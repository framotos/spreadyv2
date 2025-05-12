'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@neurofinance/api-client/src/types';
import { useApiClient } from '@/lib/hooks/useApiClient';

interface SessionsLoaderProps {
  onSessionsLoaded: (sessions: Session[]) => void;
}

export default function SessionsLoader({ onSessionsLoaded }: SessionsLoaderProps) {
  const { apiService } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      if (!apiService) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const sessions = await apiService.getSessions();
        onSessionsLoaded(sessions);
      } catch (err) {
        console.error('Error loading sessions:', err);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [apiService, onSessionsLoaded]);

  if (loading) {
    return <div className="text-center py-4">Loading sessions...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
        <button 
          className="ml-2 underline" 
          onClick={() => apiService && apiService.getSessions().then(onSessionsLoaded)}
        >
          Retry
        </button>
      </div>
    );
  }

  return null; // No UI needed if sessions loaded successfully
} 