'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client using the provided URL and anonymous key
 * @param supabaseUrl The Supabase URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns A Supabase client instance
 */
export const createSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Type guard to check if Supabase is properly configured
 * @param supabaseUrl The Supabase URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns True if Supabase is properly configured
 */
export function isSupabaseConfigured(supabaseUrl?: string, supabaseAnonKey?: string): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
} 