from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import logging
import os
import uuid
import datetime

# Assuming User model and dependency are in core.auth
from ..core.auth import User, get_current_user 
# Assuming settings are available
from ..core.config import settings 
# Import the agent service we will create
from ..services import agent_service

# TODO: Replace these global dicts with a proper service/repository layer
from ..routers.sessions import sessions, session_messages # Temporary access until state is managed properly

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Pydantic Models (Moved from debug_main.py) --- 

class AskRequest(BaseModel):
    session_id: str
    question: str
    # Remove dataset_type and years as they are no longer sent from frontend
    # dataset_type: Optional[str] = None  
    # years: Optional[List[int]] = None

class AskResponse(BaseModel):
    answer: str
    output_folder: str
    html_files: List[str]

# --- API Endpoint (Moved from debug_main.py) ---

@router.post("/", response_model=AskResponse)
async def ask_question_route(payload: AskRequest, current_user: User = Depends(get_current_user)):
    """
    Receives a session_id and a question, fetches the session's agent and runs the question.
    Uses the agent_service to handle agent interaction.
    """
    try:
        logger.info(f"Received /ask request from user {current_user.id}: {payload}")
        
        session_id = payload.session_id
        question = payload.question
        # dataset_type = payload.dataset_type # Removed
        # years = payload.years # Removed

        # --- Session Existence Check & Implicit Creation --- 
        # TODO: Refactor session management into a dedicated service/repository
        if session_id in sessions:
            if sessions[session_id].get("user_id") != current_user.id:
                logger.error(f"User {current_user.id} attempted to access session {session_id} owned by another user.")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Keine Berechtigung für diese Session"
                )
        else:
            # Implicit session creation - This should ideally be handled by a dedicated session creation endpoint/logic
            logger.warning(f"Session {session_id} not found for user {current_user.id}, creating implicitly.")
            sessions[session_id] = {
                "id": session_id,
                "user_id": current_user.id,
                "last_message": "Neue Konversation",
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": [],
                "output_folder": f"user_question_output_{session_id}"
            }
            if session_id not in session_messages:
                session_messages[session_id] = []
        # --- End Session Check --- 

        # Use the agent service to run the query
        logger.info(f"Calling agent service for session {session_id}")
        response_text, output_directory = await agent_service.run_agent_query(
            session_id=session_id,
            user_id=current_user.id,
            question=question
            # Removed dataset_type and years arguments
            # dataset_type=dataset_type,
            # years=years
        )
        logger.info(f"Agent service returned successfully for session {session_id}")

        # --- HTML File Handling --- 
        # TODO: Refactor file handling into a dedicated service/repository
        logger.info(f"Checking for HTML files in {output_directory}")
        html_files = []
        new_html_files = []
        if os.path.exists(output_directory) and os.path.isdir(output_directory):
            all_files_in_dir = os.listdir(output_directory)
            html_files = [f for f in all_files_in_dir if f.lower().endswith(".html")]
            logger.info(f"Found HTML files: {html_files}")
            
            if session_id in sessions:
                existing_files = set(sessions[session_id].get("html_files", []))
                new_html_files = [f for f in html_files if f not in existing_files]
            else:
                 # Should not happen due to implicit creation above, but fallback
                new_html_files = html_files 
        else:
            logger.warning(f"Output directory not found: {output_directory}")
        # --- End HTML File Handling ---

        output_folder_name = os.path.basename(output_directory)
        logger.info(f"Returning response with output folder: {output_folder_name}")

        # --- Assistant Message Saving --- 
        # TODO: Refactor message saving into a dedicated service/repository 
        logger.info(f"Saving assistant message to session {session_id} for user {current_user.id}")
        if session_id not in session_messages:
            session_messages[session_id] = [] # Should exist from implicit creation
            
        new_message = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id, 
            "content": response_text,
            "sender": "assistant",
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": new_html_files, # Associate only NEW files with this message
            "output_folder": output_folder_name
        }
        session_messages[session_id].append(new_message)
        # --- End Message Saving --- 

        # --- Session Update (HTML files list) --- 
        # TODO: Refactor session update logic 
        if session_id in sessions:
            # Store the complete list of HTML files found in the session data for UI display
            sessions[session_id]["html_files"] = sorted(list(set(sessions[session_id].get("html_files", [])) | set(html_files)))
        # --- End Session Update --- 

        response = AskResponse(
            answer=response_text,
            output_folder=output_folder_name,
            html_files=html_files # Return all HTML files found in this run
        )
        logger.debug(f"Response object: {response}")
        return response
        
    except FileNotFoundError as e:
        logger.error(f"Dataset file not found error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException as e: # Re-raise HTTP exceptions
        raise e 
    except Exception as e:
        logger.error(f"Error in ask_question_route: {str(e)}", exc_info=True)
        # Use a generic error message for unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An internal error occurred while processing your request.") 