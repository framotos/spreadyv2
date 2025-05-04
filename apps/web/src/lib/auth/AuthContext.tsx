'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

// Define the Auth Context types
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: AuthError | null; success: boolean }>;
  signOut: () => Promise<{ error: AuthError | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; success: boolean }>;
}

// Create the Auth Context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
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
      const { error } = await supabase.auth.signUp({
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
      const { error } = await supabase.auth.signOut();
      
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 