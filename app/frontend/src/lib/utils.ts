/**
 * Utility-Funktionen für die gesamte Anwendung
 */

/**
 * Generiert eine UUID für Client- und Server-seitige Verwendung
 * Verwendet window.crypto.randomUUID() im Browser und einen Fallback für SSR
 * 
 * @returns Eine UUID als String
 */
export const generateUUID = (): string => {
  if (typeof window !== 'undefined') {
    return window.crypto.randomUUID();
  }
  // Fallback für Server-Side-Rendering
  return 'temp-' + Math.random().toString(36).substring(2, 11);
}; 