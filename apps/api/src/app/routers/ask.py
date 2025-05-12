from fastapi import APIRouter, Depends, HTTPException, status
import logging
import os
import uuid
import datetime

# Import models from models directory
from ..models.ask import AskRequest, AskResponse
from ..models.message import Message

# Import dependencies
from ..core.auth import User, get_current_user
from ..core.config import settings
from ..dependencies import SessionRepositoryDep, MessageRepositoryDep, AgentServiceDep

logger = logging.getLogger(__name__)

router = APIRouter()

# --- API Endpoint ---

@router.post("/", response_model=AskResponse)
async def ask_question_route(
    payload: AskRequest, 
    current_user: User = Depends(get_current_user),
    session_repository: SessionRepositoryDep = None,
    message_repository: MessageRepositoryDep = None,
    agent_service: AgentServiceDep = None
):
    """
    Receives a session_id and a question, fetches the session's agent and runs the question.
    Uses the agent_service to handle agent interaction.
    """
    try:
        logger.info(f"Received /ask request from user {current_user.id}: {payload}")
        
        session_id = payload.session_id
        question = payload.question

        # --- Session Existence Check & Implicit Creation ---
        session = await session_repository.get_by_id(session_id)
        if session:
            if session.user_id != current_user.id:
                logger.error(f"User {current_user.id} attempted to access session {session_id} owned by another user.")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Keine Berechtigung für diese Session"
                )
        else:
            # Implicit session creation
            logger.warning(f"Session {session_id} not found for user {current_user.id}, creating implicitly.")
            session = await session_repository.create_or_update(
                session_id=session_id,
                user_id=current_user.id,
                data={
                    "last_message": "Neue Konversation",
                    "html_files": [],
                    "output_folder": f"user_question_output_{session_id}"
                }
            )

        # Use the agent service to run the query
        logger.info(f"Calling agent service for session {session_id}")
        response_text, output_directory = await agent_service.run_agent_query(
            session_id=session_id,
            user_id=current_user.id,
            question=question
        )
        logger.info(f"Agent service returned successfully for session {session_id}")

        # --- HTML File Handling ---
        logger.info(f"Checking for HTML files in {output_directory}")
        html_files = []
        new_html_files = []
        if os.path.exists(output_directory) and os.path.isdir(output_directory):
            all_files_in_dir = os.listdir(output_directory)
            html_files = [f for f in all_files_in_dir if f.lower().endswith(".html")]
            logger.info(f"Found HTML files: {html_files}")
            
            # Get existing HTML files from session
            session = await session_repository.get_by_id(session_id)
            if session:
                existing_files = set(session.html_files or [])
                new_html_files = [f for f in html_files if f not in existing_files]
            else:
                new_html_files = html_files
        else:
            logger.warning(f"Output directory not found: {output_directory}")

        output_folder_name = os.path.basename(output_directory)
        logger.info(f"Returning response with output folder: {output_folder_name}")

        # --- Assistant Message Saving ---
        logger.info(f"Saving assistant message to session {session_id} for user {current_user.id}")
        await message_repository.add_message(
            session_id=session_id,
            user_id=current_user.id,
            content=response_text,
            sender="assistant",
            html_files=new_html_files,
            output_folder=output_folder_name
        )

        # --- Session Update (HTML files list) ---
        if session:
            # Update session with new HTML files
            all_html_files = sorted(list(set(session.html_files or []) | set(html_files)))
            await session_repository.update(session_id, {
                "html_files": all_html_files
            })

        response = AskResponse(
            answer=response_text,
            output_folder=output_folder_name,
            html_files=html_files
        )
        logger.debug(f"Response object: {response}")
        return response
        
    except FileNotFoundError as e:
        logger.error(f"File not found error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in ask_question_route: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An internal error occurred while processing your request."
        ) 