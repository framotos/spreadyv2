'use client';

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Default API base URL
const DEFAULT_API_BASE_URL = 'http://localhost:8000';

interface ApiClientConfig {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null>;
}

// Create an Axios instance with base configuration
export const createApiClient = (config: ApiClientConfig = {}): AxiosInstance => {
  const baseURL = config.baseUrl || DEFAULT_API_BASE_URL;
  
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add the auth token
  if (config.getAccessToken) {
    client.interceptors.request.use(async (axiosConfig: InternalAxiosRequestConfig) => {
      try {
        const token = await config.getAccessToken?.();
        
        if (token) {
          axiosConfig.headers.Authorization = `Bearer ${token}`;
        }
        
        return axiosConfig;
      } catch (error) {
        console.error('Error accessing auth token:', error);
        return axiosConfig;
      }
    });
  }

  return client;
};

// Create a public client without auth
export const createPublicApiClient = (baseUrl?: string): AxiosInstance => {
  return axios.create({
    baseURL: baseUrl || DEFAULT_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}; 