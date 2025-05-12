'use client';

import React from 'react';
import { AuthProvider } from '@neurofinance/auth';
import { supabase } from '@/lib/supabase/client';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return (
    <AuthProvider supabaseClient={supabase}>
      {children}
    </AuthProvider>
  );
};

export default ClientProviders; 