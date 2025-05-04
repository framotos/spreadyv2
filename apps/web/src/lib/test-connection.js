// Node-Skript zum Testen der Supabase-Verbindung (ESM-Version)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Pfade für ESM-Module korrekt setzen
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env.local');

// .env.local Datei laden, falls vorhanden
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Umgebungsvariablen aus .env.local geladen');
} else {
  console.log('.env.local nicht gefunden, bitte manuell konfigurieren');
}

// Ersetze diese Werte mit deinen Supabase-Zugangsdaten
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'DEINE_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'DEIN_SUPABASE_ANON_KEY';

console.log('Verwende Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Teste die Verbindung mit einer einfachen Abfrage
    const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Fehler bei der Verbindung zu Supabase:', error);
      return;
    }
    
    console.log('Erfolgreich mit Supabase verbunden!');
    console.log('Anzahl der Profile:', data);
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
  }
}

// Führe den Test aus
testConnection(); 