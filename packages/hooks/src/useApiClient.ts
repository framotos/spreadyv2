import { useEffect, useState } from 'react';
import { createApiClient, ApiService } from '@neurofinance/api-client';
import { useAuth } from '@neurofinance/auth';

/**
 * Hook to create and use the API client
 * 
 * @returns The API service instance
 */
export function useApiClient() {
  const { session } = useAuth();
  const [apiService, setApiService] = useState<ApiService | null>(null);

  useEffect(() => {
    // Create a function to get the access token
    const getAccessToken = async () => {
      try {
        // Use the session from auth context if available
        if (session?.access_token) {
          return session.access_token;
        }
        
        return null;
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    };

    // Create the API client with the token provider
    const apiClient = createApiClient({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      getAccessToken
    });

    // Create the API service
    const service = new ApiService(apiClient);
    setApiService(service);
  }, [session]);

  return { apiService };
} 