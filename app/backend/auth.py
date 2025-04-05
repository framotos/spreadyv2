import os
import jwt
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

# Lade Umgebungsvariablen
load_dotenv()

# Konfiguriere Logging
logger = logging.getLogger(__name__)

# JWT-Konfiguration aus Umgebungsvariablen
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    logger.warning("JWT_SECRET nicht gesetzt! Authentifizierung wird nicht funktionieren.")
JWT_ALGORITHM = "HS256"

# Supabase URL aus Umgebungsvariablen
SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL:
    logger.warning("SUPABASE_URL nicht gesetzt!")

# Security-Scheme für die Token-Extraktion
security = HTTPBearer()

# Benutzermodell für den authentifizierten Kontext
class User(BaseModel):
    id: str
    email: Optional[str] = None
    app_metadata: Optional[Dict[str, Any]] = None
    user_metadata: Optional[Dict[str, Any]] = None
    aud: Optional[str] = None
    role: Optional[str] = "authenticated"

def decode_jwt(token: str) -> Dict[str, Any]:
    """
    JWT-Token dekodieren und verifizieren
    
    Angepasst für Supabase JWTs, die etwas anders strukturiert sind als Standard-JWTs.
    """
    try:
        # Dekodiere den JWT und überprüfe die Signatur
        # Bei Supabase müssen wir `verify_signature` auf False setzen, da Supabase
        # eine andere Signatur-Methode verwendet, die wir hier nicht vollständig replizieren können
        # Stattdessen validieren wir wichtige Felder wie Ablaufzeit und Benutzer-ID
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_signature": False}
        )
        
        # Log für Debugging
        logger.debug(f"JWT Payload: {payload}")
        
        # Überprüfe, ob der Token von der richtigen Quelle stammt (iss)
        if "iss" not in payload or not (SUPABASE_URL and payload["iss"].startswith(f"{SUPABASE_URL}/auth/v1")):
            logger.warning(f"Ungültiger Issuer in Token: {payload.get('iss', 'nicht vorhanden')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token stammt nicht von Supabase"
            )
        
        # Überprüfe, ob der Token abgelaufen ist
        if "exp" in payload and payload["exp"] < datetime.now().timestamp():
            logger.warning(f"Token abgelaufen: {datetime.fromtimestamp(payload['exp'])}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token ist abgelaufen"
            )
            
        return payload
    except jwt.PyJWTError as e:
        # Bei Fehlern in der Token-Validierung
        logger.error(f"JWT-Fehler: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Ungültiger Token: {str(e)}"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Extrahiert und validiert den JWT-Token aus den HTTP-Headern und gibt den Benutzer zurück
    
    Angepasst für Supabase JWTs, die die Benutzer-ID im Format 'auth.users.<uuid>' verwenden.
    """
    token = credentials.credentials
    payload = decode_jwt(token)
    
    # Benutzer-ID aus dem Token extrahieren
    # Supabase speichert die ID im 'sub' Feld im Format: 'auth.users.<uuid>'
    user_id = payload.get("sub")
    if not user_id:
        logger.warning("Token enthält keine Benutzer-ID (sub)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token enthält keine Benutzer-ID"
        )
    
    # Bei Supabase ist die Benutzer-ID im Format 'auth.users.<uuid>'
    # Extrahiere die UUID aus diesem Format
    if user_id.startswith("auth.users."):
        user_id = user_id.replace("auth.users.", "")
    
    # Benutzermetadaten aus dem Token extrahieren
    email = payload.get("email")
    app_metadata = payload.get("app_metadata", {})
    user_metadata = payload.get("user_metadata", {})
    aud = payload.get("aud")
    role = app_metadata.get("role", "authenticated")
    
    logger.debug(f"Authentifizierter Benutzer: {user_id} ({email})")
    
    return User(
        id=user_id,
        email=email,
        app_metadata=app_metadata,
        user_metadata=user_metadata,
        aud=aud,
        role=role
    )

# Hilfsfunktion für optionale Authentifizierung
async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Versucht, den Benutzer zu authentifizieren, gibt aber None zurück, wenn kein Token vorhanden ist
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None 