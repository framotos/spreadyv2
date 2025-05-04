'use client';

import { useState, useEffect } from 'react';

/**
 * Custom Hook für die Verwaltung von Werten im localStorage.
 * Bietet eine typensichere Schnittstelle für localStorage-Operationen.
 * 
 * @param key Der Schlüssel, unter dem der Wert im localStorage gespeichert wird
 * @param initialValue Der initiale Wert, falls kein Wert im localStorage gefunden wird
 * @returns Ein Tupel mit dem aktuellen Wert und einer Funktion zum Aktualisieren des Werts
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State für den aktuellen Wert
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialisiere den Wert nur clientseitig
  useEffect(() => {
    try {
      // Stelle sicher, dass wir im Browser sind und localStorage verfügbar ist
      if (typeof window !== 'undefined') {
        // Versuche den Wert aus dem localStorage zu laden
        const item = localStorage.getItem(key);
        // Setze den geparsten Wert, wenn vorhanden, sonst den initialValue
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.error(`Fehler beim Laden des Werts für ${key} aus localStorage:`, error);
    }
  }, [key]); // Wird nur beim ersten Rendering und bei Änderung des keys ausgeführt

  // Aktualisiere localStorage, wenn sich der Wert ändert
  useEffect(() => {
    try {
      // Stelle sicher, dass wir im Browser sind und localStorage verfügbar ist
      if (typeof window !== 'undefined') {
        // Speichere den Wert im localStorage
        localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`Fehler beim Speichern des Werts für ${key} im localStorage:`, error);
    }
  }, [key, storedValue]);

  // Funktion zum Aktualisieren des Werts im State und localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Ermögliche funktionale Updates (ähnlich wie setState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Aktualisiere den State
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Werts für ${key}:`, error);
    }
  };

  return [storedValue, setValue] as const;
} 