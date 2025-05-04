'use client';

import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">NeuroFinance</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Passwort zurücksetzen
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ResetPasswordForm />
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-teal-600 hover:text-teal-500">
            Zurück zur Anmeldung
          </Link>
        </div>
      </div>
    </div>
  );
} 