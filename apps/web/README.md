# NeuroFinance Frontend

Dies ist das Frontend für die NeuroFinance-Anwendung, eine Chat-basierte Finanzanalyse-Plattform, die mit KI-Unterstützung arbeitet.

## Technologien

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios für API-Anfragen

## Funktionen

- Chat-basierte Benutzeroberfläche für die Interaktion mit dem KI-Assistenten
- Auswahl von Datensätzen (Einnahmen, Bilanz oder beide)
- Filterung nach Jahren
- Anzeige von Visualisierungen, die vom Backend generiert werden

## Installation und Start

1. Installieren Sie die Abhängigkeiten:

```bash
cd app/frontend
npm install
```

2. Starten Sie den Entwicklungsserver:

```bash
npm run dev
```

Die Anwendung ist dann unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Backend-Integration

Das Frontend kommuniziert mit dem Backend über die API-Endpunkte, die in der Datei `src/lib/api.ts` definiert sind. Die API-Anfragen werden über den Proxy in der Next.js-Konfiguration an das Backend weitergeleitet.

## Projektstruktur

- `src/app`: Next.js App Router
- `src/components`: React-Komponenten
- `src/lib`: Hilfsfunktionen, API-Client und TypeScript-Typen

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
