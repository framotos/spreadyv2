import type { Metadata } from "next";
import "../styles/globals.css";
import '../styles/fonts.css';
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: "NeuroFinance - Finanzanalyse mit KI",
  description: "Analysieren Sie Finanzdaten mit Hilfe von KI und Chat-basierten Agenten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <main className="w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
