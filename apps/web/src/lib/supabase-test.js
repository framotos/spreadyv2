// Einfacher Test für Supabase-Verbindung
import { createClient } from '@supabase/supabase-js';

// Ersetze diese Werte mit deinen Supabase-Zugangsdaten
const supabaseUrl = 'DEINE_SUPABASE_URL';
const supabaseAnonKey = 'DEIN_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Einfache Testfunktion
export async function testSupabaseConnection() {
  try {
    // Ping die Datenbank an
    const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' });
    
    if (error) {
      console.error('Supabase Verbindungsfehler:', error);
      return { success: false, error };
    }
    
    console.log('Supabase Verbindung erfolgreich!', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
    return { success: false, error };
  }
}

// Führe den Test aus, wenn die Datei direkt ausgeführt wird
if (typeof window !== 'undefined') {
  testSupabaseConnection().then(result => {
    console.log('Test-Ergebnis:', result);
  });
} 