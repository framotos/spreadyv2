# NeuroFinance

NeuroFinance ist eine Anwendung zur Analyse von Finanzdaten mit Hilfe von KI. Die Anwendung besteht aus einem FastAPI-Backend und einem Next.js-Frontend.

## Projektstruktur

- `backend/`: FastAPI-Backend mit KI-Agenten zur Analyse von Finanzdaten
- `frontend/`: Next.js-Frontend mit React, TypeScript und Tailwind CSS
- `archive/`: Archivierte Dateien

## Backend

Das Backend verwendet FastAPI und stellt einen Endpunkt bereit, der es ermöglicht, Fragen zu Finanzdaten zu stellen. Die Antworten werden mit Hilfe von KI-Agenten generiert, die Code ausführen können, um Daten zu analysieren und zu visualisieren.

### Funktionen

- Sitzungsbasierte Agenten, die Konversationen verfolgen können
- Unterstützung für verschiedene Datensätze (Einnahmen und Bilanz)
- Filterung nach Jahren
- Generierung von Visualisierungen mit Plotly

### Installation und Start

```bash
cd app/backend
pip install -r requirements.txt
python main.py
```

Das Backend ist dann unter [http://localhost:8000](http://localhost:8000) verfügbar.

## Frontend

Das Frontend ist eine Next.js-Anwendung mit React, TypeScript und Tailwind CSS. Es bietet eine Chat-basierte Benutzeroberfläche für die Interaktion mit dem KI-Assistenten.

### Funktionen

- Chat-basierte Benutzeroberfläche
- Auswahl von Datensätzen und Jahren
- Anzeige von Visualisierungen

### Installation und Start

```bash
cd app/frontend
npm install
npm run dev
```

Das Frontend ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Verwendung

1. Starten Sie das Backend und das Frontend
2. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser
3. Stellen Sie Fragen zu den Finanzdaten, z.B. "Wie haben sich die Einnahmen in den letzten Jahren entwickelt?"
4. Wählen Sie optional den Datensatztyp und die Jahre aus
5. Der KI-Assistent analysiert die Daten und generiert Antworten und Visualisierungen 