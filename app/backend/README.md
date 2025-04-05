# NeuroFinance Backend API

## Authentifizierung

Das Backend verwendet JWT-basierte Authentifizierung über Supabase. Alle Endpunkte außer `/health` erfordern eine Authentifizierung.

## API Testen mit Postman/Insomnia

### Öffentlicher Endpunkt

Der Health-Check-Endpunkt ist öffentlich zugänglich und erfordert keine Authentifizierung:

```
GET http://localhost:8000/health
```

### Authentifizierte Endpunkte

Für den Zugriff auf authentifizierte Endpunkte benötigst du einen gültigen JWT-Token von Supabase. So erhältst du einen Token für Tests:

1. **Token von Supabase bekommen:**
   - Melde dich in der Frontend-App an
   - Öffne die Browser-Entwicklertools (F12)
   - Gehe zu "Application" > "Local Storage"
   - Finde den Eintrag `sb-<projekt-id>-auth-token`
   - Kopiere den Wert des `access_token`-Felds

2. **Token in Postman/Insomnia verwenden:**
   - Füge den Header `Authorization: Bearer <dein-token>` hinzu
   - Ersetze `<dein-token>` durch den kopierten Wert

### Beispiel-Anfragen

#### Sessions abrufen:
```
GET http://localhost:8000/sessions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Nachrichten einer Session abrufen:
```
GET http://localhost:8000/sessions/{session_id}/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Nachricht hinzufügen:
```
POST http://localhost:8000/sessions/{session_id}/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Deine Nachricht hier",
  "sender": "user"
}
```

#### Frage stellen:
```
POST http://localhost:8000/ask
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "session_id": "deine-session-id",
  "question": "Was ist das KGV von Meta?",
  "dataset_type": "balance",
  "years": [2022, 2023]
}
```

## Fehlerbehebung

### Authentifizierungsfehler

Wenn du einen 401-Fehler erhältst, überprüfe Folgendes:

1. Ist der Token gültig und nicht abgelaufen?
2. Hast du den Token im richtigen Format angegeben? (`Bearer <token>`)
3. Ist der `JWT_SECRET` im Backend korrekt konfiguriert?

### Session-Fehler

Wenn du einen 404-Fehler für Sessions erhältst:

1. Existiert die Session-ID?
2. Gehört die Session zu deinem Benutzerkonto? 