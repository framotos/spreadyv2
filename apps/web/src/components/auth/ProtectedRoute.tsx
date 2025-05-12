'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute as AuthProtectedRoute, useAuth } from '@neurofinance/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Custom loading component
  const loadingComponent = (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );

  return (
    <AuthProtectedRoute 
      router={router} 
      redirectTo={redirectTo}
      loadingComponent={loadingComponent}
    >
      {children}
    </AuthProtectedRoute>
  );
};

export default ProtectedRoute; 