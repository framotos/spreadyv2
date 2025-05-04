'use client';

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase/client';

// API-Basis-URL
const API_BASE_URL = 'http://localhost:8000';

// Erstelle eine Axios-Instanz mit Basis-Konfiguration
const createClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request-Interceptor zum Hinzufügen des Auth-Tokens
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
      // Hole die aktuelle Session von Supabase
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      // Wenn eine Session existiert, füge den Token zu den Headers hinzu
      if (session) {
        // Setze den Authorization-Header mit dem Token
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }

      return config;
    } catch (error) {
      console.error('Fehler beim Zugriff auf die Auth-Session:', error);
      return config;
    }
  });

  return client;
};

// Exportiere den authentifizierten Client
export const apiClient = createClient();

// Exportiere eine Version ohne Auth für öffentliche Endpunkte
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health-Check-Funktion (öffentlicher Endpunkt)
export const checkHealth = async () => {
  try {
    const response = await publicApiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Fehler beim Health-Check:', error);
    throw error;
  }
}; 