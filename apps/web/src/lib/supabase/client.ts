'use client';

import { createSupabaseClient, isSupabaseConfigured } from '@neurofinance/auth';

// Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the entire app
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
export function checkSupabaseConfig(): boolean {
  return isSupabaseConfigured(supabaseUrl, supabaseAnonKey);
} 