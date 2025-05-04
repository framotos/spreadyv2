import uuid
import datetime
from typing import List, Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# Assuming User model and dependency are in core.auth
from ..core.auth import User, get_current_user 
# Assuming settings are available (adjust path if needed)
from ..core.config import settings

# TODO: Replace these in-memory dicts with a proper service/repository layer later
sessions: dict = {}
session_messages: dict = {}

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Pydantic Models (Moved from debug_main.py) --- 

class BackendSession(BaseModel):
    id: str
    user_id: Optional[str] = None
    last_message: Optional[str] = None
    timestamp: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

class Message(BaseModel):
    id: str
    user_id: Optional[str] = None 
    content: str
    sender: str  # 'user' or 'assistant'
    timestamp: str
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

class AddMessageRequest(BaseModel):
    content: str
    sender: str
    # user_id is implicitly the current_user.id, removed from request model
    # user_id: Optional[str] = None 
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None # TODO: Should this be settable by client?

class UpdateSessionRequest(BaseModel):
    last_message: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

# --- API Endpoints (Moved from debug_main.py) ---

@router.get("/", response_model=List[BackendSession])
async def get_sessions_route(current_user: User = Depends(get_current_user)):
    """
    Returns a list of all sessions for the authenticated user.
    """
    logger.info(f"GET /sessions endpoint called for user {current_user.id}")
    
    # Filtere Sitzungen nach Benutzer-ID
    user_sessions = [
        BackendSession(
            id=session_id,
            user_id=session_data.get("user_id"),
            last_message=session_data.get("last_message", "Neue Konversation"),
            timestamp=session_data.get("timestamp", datetime.datetime.now().isoformat()),
            html_files=session_data.get("html_files", []),
            output_folder=session_data.get("output_folder")
        ) 
        for session_id, session_data in sessions.items()
        if session_data.get("user_id") == current_user.id  # Nur Sitzungen des authentifizierten Benutzers
    ]
    
    return user_sessions

@router.get("/{session_id}/messages", response_model=List[Message])
async def get_session_messages_route(session_id: str, current_user: User = Depends(get_current_user)):
    """
    Gibt alle Nachrichten einer Session zurück.
    """
    logger.info(f"GET /sessions/{session_id}/messages endpoint called for user {current_user.id}")
    
    # Prüfe, ob die Session existiert und zum Benutzer gehört
    if session_id in sessions and sessions[session_id].get("user_id") == current_user.id:
        if session_id not in session_messages:
            # Falls es noch keine Nachrichten gibt, initialisiere mit Willkommensnachricht
            # TODO: Move default message creation elsewhere?
            session_messages[session_id] = [{
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "content": "Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?",
                "sender": "assistant",
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": [],
                "output_folder": sessions.get(session_id, {}).get("output_folder", "")
            }]
        
        # Filtere Nachrichten nach Benutzer-ID (redundant check if session check passed?)
        user_messages = [
            Message(**msg) for msg in session_messages[session_id]
            if msg.get("user_id") == current_user.id
        ]
        
        return user_messages
    else:
        # Session existiert nicht oder gehört nicht zum Benutzer
        logger.warning(f"Session {session_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )

@router.post("/{session_id}/messages", response_model=Message)
async def add_session_message_route(session_id: str, message: AddMessageRequest, current_user: User = Depends(get_current_user)):
    """
    Fügt eine neue Nachricht zu einer Session hinzu.
    """
    logger.info(f"POST /sessions/{session_id}/messages endpoint called for user {current_user.id}")
    
    # Prüfe, ob die Session existiert und zum Benutzer gehört
    if session_id in sessions and sessions[session_id].get("user_id") == current_user.id:
        # Initialisiere die Nachrichtenliste, falls sie noch nicht existiert
        if session_id not in session_messages:
            session_messages[session_id] = []
        
        # Erstelle die neue Nachricht mit Benutzer-ID
        new_message_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "content": message.content,
            "sender": message.sender,
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": message.html_files or [],
            "output_folder": message.output_folder or sessions.get(session_id, {}).get("output_folder", "")
        }
        
        # Füge die Nachricht hinzu (as dict first)
        session_messages[session_id].append(new_message_data)
        
        # Aktualisiere Session Metadaten (nur für user Nachrichten?)
        if message.sender == "user":
            sessions[session_id]["last_message"] = message.content
            sessions[session_id]["timestamp"] = new_message_data["timestamp"]
        
        return Message(**new_message_data)
    else:
        # Session existiert nicht oder gehört nicht zum Benutzer
        logger.warning(f"Session {session_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )

@router.put("/{session_id}", response_model=BackendSession)
async def update_session_route(session_id: str, session_update: UpdateSessionRequest, current_user: User = Depends(get_current_user)):
    """
    Updates an existing session or creates a new one if it doesn't exist.
    """
    logger.info(f"PUT /sessions/{session_id} endpoint called for user {current_user.id}")
    
    # Prüfe, ob die Session existiert und zum Benutzer gehört, sonst erstelle sie
    if session_id not in sessions or sessions[session_id].get("user_id") != current_user.id:
        # Check if it exists but belongs to another user (should be rare, but check)
        if session_id in sessions and sessions[session_id].get("user_id") != current_user.id:
            logger.error(f"Attempt by user {current_user.id} to update session {session_id} owned by {sessions[session_id].get('user_id')}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Keine Berechtigung für diese Session"
            )
        # Create new session if it doesn't exist for this user
        logger.info(f"Creating new session {session_id} for user {current_user.id}")
        sessions[session_id] = {
            "id": session_id,
            "user_id": current_user.id,
            "last_message": "Neue Konversation", # Default message
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": [],
             # Generate output folder name using full ID
            "output_folder": f"user_question_output_{session_id}" 
        }
        # Initialize message list for new session
        if session_id not in session_messages:
            session_messages[session_id] = []

    # Session exists and belongs to the user, proceed with update
    session_data = sessions[session_id]
    updated = False

    if session_update.last_message is not None:
        session_data["last_message"] = session_update.last_message
        updated = True
    
    if session_update.output_folder is not None:
        session_data["output_folder"] = session_update.output_folder
        updated = True
    
    if session_update.html_files is not None:
        # Append unique new files
        current_html_files = set(session_data.get("html_files", []))
        new_files_added = False
        for html_file in session_update.html_files:
            if html_file not in current_html_files:
                current_html_files.add(html_file)
                new_files_added = True
        if new_files_added:
            session_data["html_files"] = sorted(list(current_html_files))
            updated = True
    
    # Update timestamp only if other fields were updated
    if updated:
        session_data["timestamp"] = datetime.datetime.now().isoformat()
    
    # Return the potentially updated session state
    return BackendSession(**session_data) 