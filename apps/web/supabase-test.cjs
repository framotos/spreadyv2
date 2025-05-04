// Eigenständiges Node.js-Skript zum Testen der Supabase-Verbindung
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

// Supabase-Zugangsdaten aus Umgebungsvariablen oder direkt einsetzen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'DEINE_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'DEIN_SUPABASE_ANON_KEY';

console.log('Teste Verbindung zu Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Teste eine einfachere Abfrage
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Fehler bei der Verbindung zur Supabase Auth API:', error);
      return;
    }
    
    console.log('Erfolgreich mit Supabase Auth API verbunden!');
    
    // Teste Zugriff auf Tabellen
    const { data: tablesData, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      // Möglicherweise existiert die Tabelle noch nicht
      console.log('Fehler beim Abfragen der profiles-Tabelle:', tablesError.message);
      console.log('Wenn die Tabelle nicht existiert, ist das in Ordnung. Wir werden sie später erstellen.');
    } else {
      console.log('Erfolgreich auf die profiles-Tabelle zugegriffen!');
      console.log('Daten:', tablesData);
    }
    
    console.log('Supabase-Verbindungstest abgeschlossen.');
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
  }
}

// Führe den Test aus
testConnection(); 