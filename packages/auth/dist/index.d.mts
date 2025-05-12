import React, { ReactNode } from 'react';
import * as _supabase_supabase_js from '@supabase/supabase-js';
import { Session, User, AuthError, SupabaseClient } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{
        error: AuthError | null;
        success: boolean;
    }>;
    signUp: (email: string, password: string, metadata?: object) => Promise<{
        error: AuthError | null;
        success: boolean;
    }>;
    signOut: () => Promise<{
        error: AuthError | null;
        success: boolean;
    }>;
    resetPassword: (email: string) => Promise<{
        error: AuthError | null;
        success: boolean;
    }>;
}
interface AuthProviderProps {
    children: ReactNode;
    supabaseClient: SupabaseClient;
}
/**
 * Auth Provider Component
 * @param props The component props
 * @returns The Auth Provider component
 */
declare const AuthProvider: React.FC<AuthProviderProps>;
/**
 * Hook to use the auth context
 * @returns The auth context
 */
declare const useAuth: () => AuthContextType;

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
    router: {
        push: (path: string) => void;
    };
    loadingComponent?: React.ReactNode;
}
/**
 * Protected Route Component
 * Redirects to login page if user is not authenticated
 *
 * @param props The component props
 * @returns The Protected Route component
 */
declare const ProtectedRoute: React.FC<ProtectedRouteProps>;

/**
 * Creates a Supabase client using the provided URL and anonymous key
 * @param supabaseUrl The Supabase URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns A Supabase client instance
 */
declare const createSupabaseClient: (supabaseUrl: string, supabaseAnonKey: string) => _supabase_supabase_js.SupabaseClient<any, "public", any>;
/**
 * Type guard to check if Supabase is properly configured
 * @param supabaseUrl The Supabase URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns True if Supabase is properly configured
 */
declare function isSupabaseConfigured(supabaseUrl?: string, supabaseAnonKey?: string): boolean;

export { type AuthContextType, AuthProvider, type AuthProviderProps, ProtectedRoute, type ProtectedRouteProps, createSupabaseClient, isSupabaseConfigured, useAuth };
