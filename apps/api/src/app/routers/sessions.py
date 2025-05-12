import uuid
import datetime
from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException, status

# Import models from models directory
from ..models.session import BackendSession, UpdateSessionRequest
from ..models.message import Message, AddMessageRequest

# Import dependencies
from ..core.auth import User, get_current_user
from ..dependencies import SessionRepositoryDep, MessageRepositoryDep

logger = logging.getLogger(__name__)

router = APIRouter()

# --- API Endpoints ---

@router.get("/", response_model=List[BackendSession])
async def get_sessions_route(
    current_user: User = Depends(get_current_user),
    session_repository: SessionRepositoryDep = None
):
    """
    Returns a list of all sessions for the authenticated user.
    """
    logger.info(f"GET /sessions endpoint called for user {current_user.id}")
    
    # Get sessions for the user
    user_sessions = await session_repository.get_by_user_id(current_user.id)
    
    return user_sessions

@router.get("/{session_id}/messages", response_model=List[Message])
async def get_session_messages_route(
    session_id: str, 
    current_user: User = Depends(get_current_user),
    session_repository: SessionRepositoryDep = None,
    message_repository: MessageRepositoryDep = None
):
    """
    Returns all messages for a session.
    """
    logger.info(f"GET /sessions/{session_id}/messages endpoint called for user {current_user.id}")
    
    # Check if the session exists and belongs to the user
    if not await session_repository.belongs_to_user(session_id, current_user.id):
        logger.warning(f"Session {session_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )
    
    # Get messages for the session
    messages = await message_repository.get_by_session_id(session_id, current_user.id)
    
    # Add welcome message if there are no messages
    if not messages:
        # Get session to get output folder
        session = await session_repository.get_by_id(session_id)
        output_folder = session.output_folder if session else None
        
        # Add welcome message
        welcome_message = await message_repository.add_welcome_message(
            session_id=session_id,
            user_id=current_user.id,
            output_folder=output_folder
        )
        
        messages = [welcome_message]
    
    return messages

@router.post("/{session_id}/messages", response_model=Message)
async def add_session_message_route(
    session_id: str, 
    message: AddMessageRequest, 
    current_user: User = Depends(get_current_user),
    session_repository: SessionRepositoryDep = None,
    message_repository: MessageRepositoryDep = None
):
    """
    Adds a new message to a session.
    """
    logger.info(f"POST /sessions/{session_id}/messages endpoint called for user {current_user.id}")
    
    # Check if the session exists and belongs to the user
    if not await session_repository.belongs_to_user(session_id, current_user.id):
        logger.warning(f"Session {session_id} not found or not owned by user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )
    
    # Get session to get output folder if not provided
    session = await session_repository.get_by_id(session_id)
    output_folder = message.output_folder or (session.output_folder if session else "")
    
    # Add message to session
    new_message = await message_repository.add_message(
        session_id=session_id,
        user_id=current_user.id,
        content=message.content,
        sender=message.sender,
        html_files=message.html_files,
        output_folder=output_folder
    )
    
    # Update session metadata if it's a user message
    if message.sender == "user":
        await session_repository.update(session_id, {
            "last_message": message.content,
            "timestamp": datetime.datetime.now().isoformat()
        })
    
    return new_message

@router.put("/{session_id}", response_model=BackendSession)
async def update_session_route(
    session_id: str, 
    session_update: UpdateSessionRequest, 
    current_user: User = Depends(get_current_user),
    session_repository: SessionRepositoryDep = None
):
    """
    Updates an existing session or creates a new one if it doesn't exist.
    """
    logger.info(f"PUT /sessions/{session_id} endpoint called for user {current_user.id}")
    
    try:
        # Create or update session
        updated_session = await session_repository.create_or_update(
            session_id=session_id,
            user_id=current_user.id,
            data={
                "last_message": session_update.last_message,
                "html_files": session_update.html_files,
                "output_folder": session_update.output_folder
            }
        )
        
        return updated_session
    except ValueError as e:
        # Session exists but belongs to another user
        logger.error(f"Error updating session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Keine Berechtigung für diese Session"
        ) 