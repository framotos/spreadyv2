import { useState } from 'react';
import { HtmlFile } from '@/lib/types';

/**
 * Custom Hook zur Verwaltung der HTML-Datei-Auswahl.
 * 
 * @returns Ein Objekt mit der ausgewählten HTML-Datei und Funktionen zur Auswahl
 */
export function useHtmlFileSelection() {
  const [selectedFile, setSelectedFile] = useState<HtmlFile | null>(null);

  /**
   * Wählt eine HTML-Datei aus.
   */
  const selectFile = (fileName: string, outputFolder: string) => {
    setSelectedFile({ fileName, outputFolder });
  };

  /**
   * Setzt die Auswahl zurück.
   */
  const resetSelection = () => {
    setSelectedFile(null);
  };

  return {
    selectedFile,
    selectFile,
    resetSelection
  };
} 