import type { Metadata } from "next";
import "../styles/globals.css";
import '../styles/fonts.css';
import ClientProviders from "../components/ClientProviders";

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
        <ClientProviders>
          <main className="w-full">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
