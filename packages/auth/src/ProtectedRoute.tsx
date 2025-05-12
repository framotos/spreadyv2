'use client';

import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface ProtectedRouteProps {
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
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  router,
  loadingComponent,
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading component or default spinner while loading
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // If user is authenticated, render children
  return user ? <>{children}</> : null;
}; 