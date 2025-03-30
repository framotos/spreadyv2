import { createClient } from '@supabase/supabase-js';

// Umgebungsvariablen aus Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Wenn die Umgebungsvariablen nicht gesetzt sind, Fehlermeldung ausgeben
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Fehlende Supabase-Umgebungsvariablen. Stelle sicher, dass .env.local Datei vorhanden ist mit:\n',
    'NEXT_PUBLIC_SUPABASE_URL=...\n',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=...'
  );
}

// Erstelle und exportiere den Supabase-Client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Hilfsfunktion zum Abrufen des aktuellen Benutzers
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Hilfsfunktion zum Prüfen, ob ein Benutzer angemeldet ist
export async function isUserLoggedIn() {
  const user = await getCurrentUser();
  return !!user;
} 