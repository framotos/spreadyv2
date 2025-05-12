'use client';

import React from 'react';
import { useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthError, Session, User, SupabaseClient } from '@supabase/supabase-js';

// Define the Auth Context types
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: AuthError | null; success: boolean }>;
  signOut: () => Promise<{ error: AuthError | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; success: boolean }>;
}

// Create the Auth Context with default values
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  supabaseClient: SupabaseClient;
}

/**
 * Auth Provider Component
 * @param props The component props
 * @returns The Auth Provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  supabaseClient
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      
      // Get the current session
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error.message);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      setLoading(false);
    };

    // Initialize session
    getSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      
      return {
        error,
        success: !error,
      };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return {
        error: error as AuthError,
        success: false,
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata: object = {}) => {
    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      return {
        error,
        success: !error,
      };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return {
        error: error as AuthError,
        success: false,
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      
      return {
        error,
        success: !error,
      };
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      return {
        error: error as AuthError,
        success: false,
      };
    }
  };

  // Reset password (sends password reset email)
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined,
      });
      
      return {
        error,
        success: !error,
      };
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      return {
        error: error as AuthError,
        success: false,
      };
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use the auth context
 * @returns The auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 