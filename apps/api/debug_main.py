import os
import uuid
import shutil
import traceback
import logging
import datetime
from typing import List, Optional, Dict, Any

import pandas as pd
import plotly.express as px
from fastapi import FastAPI, Body, Request, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn 

# Import settings first
from core.config import settings

from smolagents import CodeAgent, OpenAIServerModel
from smolagents.agents import PromptTemplates
from smolagents.agents import PlanningPromptTemplate, ManagedAgentPromptTemplate, FinalAnswerPromptTemplate
from prompts import generate_prompt, SYSTEM_PROMPT

from dotenv import load_dotenv

# Importiere Authentifizierungskomponenten
from auth import User, get_current_user, get_optional_user

# Konfiguriere Logging
logging.basicConfig(
    # Use LOG_LEVEL from settings
    level=settings.LOG_LEVEL.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Aktiviere detailliertes Logging für die OpenAI-Bibliothek
logging.getLogger("openai").setLevel(logging.DEBUG)
logging.getLogger("httpx").setLevel(logging.DEBUG)
logging.getLogger("httpcore").setLevel(logging.DEBUG)

# Remove direct loading and logging of API key
# load_dotenv()
# GEMNINI_APIKEY = os.getenv("GEMNINI_APIKEY")
# logger.info("GEMNINI_APIKEY loaded.")

# Speichern von Sitzungsinformationen
user_agents = {}
sessions = {}  # Speichert Sitzungsinformationen: ID, letzter Zeitstempel, HTML-Dateien, Ausgabeordner
session_messages = {}  # Speichert alle Nachrichten pro Session-ID

# Add new filenames
BALANCE_INFO_FILENAME = "balance_companies_info.csv"
INCOME_INFO_FILENAME = "income_companies_info.csv"
BALANCE_INCOME_INFO_FILENAME = "balance_income_companies_info.csv" # New default


class AskRequest(BaseModel):
    session_id: str
    question: str
    dataset_type: Optional[str] = None  # 'income' or 'balance'
    years: Optional[List[int]] = None


class AskResponse(BaseModel):
    answer: str
    output_folder: str
    html_files: List[str]


class BackendSession(BaseModel):
    id: str
    user_id: Optional[str] = None  # Neue Feld für die Benutzer-ID
    last_message: Optional[str] = None
    timestamp: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

# Neue Modelle für die Nachrichtenverwaltung
class Message(BaseModel):
    id: str
    user_id: Optional[str] = None  # Neue Feld für die Benutzer-ID
    content: str
    sender: str  # 'user' oder 'assistant'
    timestamp: str
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

class AddMessageRequest(BaseModel):
    content: str
    sender: str
    user_id: Optional[str] = None  # Neue Feld für die Benutzer-ID
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

# Create a helper to ensure each session has its own agent
def get_or_create_agent_for_session(session_id: str, user_id: Optional[str] = None) -> CodeAgent:
    """
    Returns the CodeAgent associated with session_id.
    If none exists, it creates a new agent instance and stores it.
    """
    try:
        if session_id not in user_agents:
            logger.info(f"Creating new agent for session {session_id}")
            # Create a new agent for this session
            logger.debug("Initializing OpenAIServerModel")
            model = OpenAIServerModel(
                model_id="gemini-2.0-flash-exp",
                # Use API key from settings
                api_key=settings.GEMNINI_APIKEY,
                api_base="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
            logger.debug("OpenAIServerModel initialized")
            
            logger.debug("Creating PromptTemplates")
            prompt_templates = PromptTemplates(
                system_prompt=SYSTEM_PROMPT,
                planning=PlanningPromptTemplate(
                    pre_messages="",
                    post_messages=""
                ),
                managed_agent=ManagedAgentPromptTemplate(
                    pre_messages="",
                    post_messages=""
                ),
                final_answer=FinalAnswerPromptTemplate(
                    pre_messages="",
                    post_messages=""
                )
            )
            logger.debug("PromptTemplates created")
            
            logger.debug("Creating CodeAgent")
            agent = CodeAgent(
                tools=[],  # Tools can be added as needed
                model=model,
                additional_authorized_imports=["pandas", "plotly", "numpy"],
                # system_prompt=SYSTEM_PROMPT,
                prompt_templates=prompt_templates,
                verbosity_level=1
            )
            logger.debug("CodeAgent created")
            
            user_agents[session_id] = agent
            
            # Initialisiere Sitzungsinformationen
            if session_id not in sessions:
                output_dir_name = f"user_question_output_{session_id}"
                sessions[session_id] = {
                    "id": session_id,
                    "user_id": user_id,  # Setze die Benutzer-ID bei der Erstellung
                    "last_message": "Neue Konversation",
                    "timestamp": datetime.datetime.now().isoformat(),
                    "html_files": [],
                    "output_folder": output_dir_name
                }
                
        return user_agents[session_id]
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        logger.error(traceback.format_exc())
        raise

def run_agent_in_directory(
    agent: CodeAgent,
    user_question: str,
    dataset_type: Optional[str], # 'income', 'balance', or None
    years: Optional[List[int]],
    session_id: str,
    # REMOVE old filename defaults from args
    # balance_dataset_filename: str = BALANCE_DATASET_FILENAME,
    # income_dataset_filename: str = INCOME_DATASET_FILENAME,
    # Use base_output_dir from settings
    base_output_dir: str = settings.BASE_OUTPUT_DIR
) -> (str, str):
    """
    Runs the agent in a specific directory, copies the dataset,
    and ensures outputs are saved there. Minimal changes for dataset swap.
    """
    try:
        logger.info(f"Running agent with question: {user_question}")
        logger.info(f"Dataset type: {dataset_type}, Years: {years}")

        original_working_directory = os.getcwd()

        # Keep existing output folder logic (no cleanup)
        if session_id in sessions and "output_folder" in sessions[session_id]:
            output_folder_name = sessions[session_id]["output_folder"]
        else:
            output_folder_name = f"user_question_output_{session_id}"

        output_dir_name_rel = f"{base_output_dir}/{output_folder_name}" # Relative path name part
        output_directory = os.path.join(original_working_directory, output_dir_name_rel)
        os.makedirs(output_directory, exist_ok=True)

        # --- Select dataset file(s) based on dataset_type using NEW filenames ---
        dataset_filenames_to_copy = []
        dataset_identifier_for_prompt = None # To tell generate_prompt which dataset we ended up using

        if dataset_type == "income": # Now map 'income' to the specific info file
            dataset_filenames_to_copy = [INCOME_INFO_FILENAME]
            dataset_identifier_for_prompt = "income_info"
            logger.info(f"Selected dataset file: {INCOME_INFO_FILENAME}")
        elif dataset_type == "balance": # Now map 'balance' to the specific info file
            dataset_filenames_to_copy = [BALANCE_INFO_FILENAME]
            dataset_identifier_for_prompt = "balance_info"
            logger.info(f"Selected dataset file: {BALANCE_INFO_FILENAME}")
        else: # Handles None or any other value - use the new default combined dataset
            dataset_filenames_to_copy = [BALANCE_INCOME_INFO_FILENAME]
            dataset_identifier_for_prompt = "balance_income_info"
            logger.info(f"No specific dataset type requested. Using default: {BALANCE_INCOME_INFO_FILENAME}")
        # --- END DATASET SELECTION ---

        # Copy selected dataset file(s)
        for filename in dataset_filenames_to_copy:
            dataset_source_path = os.path.join(original_working_directory, "data", filename)
            dataset_destination_path = os.path.join(output_directory, filename)
            if os.path.exists(dataset_source_path):
                logger.info(f"Copying dataset from {dataset_source_path} to {dataset_destination_path}")
                shutil.copy2(dataset_source_path, dataset_destination_path)
            else:
                logger.error(f"Dataset file not found: {dataset_source_path}")
                # Keep simple error handling for now
                raise FileNotFoundError(f"Required dataset file not found: {filename}")

        # --- Generate dataset description using the identifier ---
        # Pass the identifier that matches the logic in prompts.py
        dataset_description = generate_prompt(dataset_identifier_for_prompt, years)


        # --- Create the prompt text, informing agent of available file(s) ---
        # Tell the agent the exact filename(s) it can load
        copied_filenames_str = ", ".join(f"'{f}'" for f in dataset_filenames_to_copy)
        # Keep original instruction for saving files for minimal change, though relative is better
        prompt = f"""This is the user question: {user_question}

{dataset_description}

You can find the dataset file(s) {copied_filenames_str} in the current working directory: '{output_dir_name_rel}'. Please load the appropriate file(s) using this path.

If you are asked to create any graphs save them also in your user directory: '{output_dir_name_rel}' like this: `fig.write_html("{output_dir_name_rel}/your_name_for_the_graph.html")`.
"""
        logger.debug(f"Generated prompt: {prompt}")
        # --- END PROMPT TEXT ---


        # Note the `reset=False` so it keeps track of conversation for that session
        logger.info("Running agent with prompt")
        try:
            # No os.chdir() for minimal change, rely on agent handling the path in prompt
            response_chart = agent.run(prompt, reset=False)
            logger.info(f"Agent response: {response_chart[:100]}...")
        except Exception as e:
            logger.error(f"Error in agent.run: {str(e)}")
            logger.error(f"Error details: {traceback.format_exc()}")
            raise

        return response_chart, output_directory # Return full path
    except Exception as e:
        logger.error(f"Error running agent: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# ---- FASTAPI SETUP ----
app = FastAPI()

# Add exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Exception Handler für Authentifizierungsfehler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        logger.warning(f"Authentifizierungsfehler: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers={"WWW-Authenticate": "Bearer"}
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Use allowed origins from settings
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the user_output directory as static so HTML files can be served directly
app.mount(
    # Use base_output_dir from settings for mount path
    f"/{settings.BASE_OUTPUT_DIR}", 
    StaticFiles(directory=settings.BASE_OUTPUT_DIR), 
    name=settings.BASE_OUTPUT_DIR
)

# Öffentlicher Health-Check-Endpunkt (keine Authentifizierung erforderlich)
@app.get("/health")
async def health_check():
    """
    Einfacher Health-Check-Endpunkt, der keine Authentifizierung erfordert.
    """
    return {
        "status": "ok",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/sessions")
async def get_sessions(current_user: User = Depends(get_current_user)):
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

@app.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, current_user: User = Depends(get_current_user)):
    """
    Gibt alle Nachrichten einer Session zurück.
    """
    logger.info(f"GET /sessions/{session_id}/messages endpoint called for user {current_user.id}")
    
    # Prüfe, ob die Session existiert und zum Benutzer gehört
    if session_id in sessions and sessions[session_id].get("user_id") == current_user.id:
        if session_id not in session_messages:
            # Falls es noch keine Nachrichten gibt, initialisiere mit Willkommensnachricht
            session_messages[session_id] = [{
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "content": "Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?",
                "sender": "assistant",
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": [],
                "output_folder": sessions.get(session_id, {}).get("output_folder", "")
            }]
        
        # Filtere Nachrichten nach Benutzer-ID
        user_messages = [
            msg for msg in session_messages[session_id]
            if msg.get("user_id") == current_user.id
        ]
        
        return user_messages
    else:
        # Session existiert nicht oder gehört nicht zum Benutzer
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )

@app.post("/sessions/{session_id}/messages")
async def add_session_message(session_id: str, message: AddMessageRequest, current_user: User = Depends(get_current_user)):
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
        new_message = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "content": message.content,
            "sender": message.sender,
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": message.html_files or [],
            "output_folder": message.output_folder or sessions.get(session_id, {}).get("output_folder", "")
        }
        
        # Füge die Nachricht hinzu
        session_messages[session_id].append(new_message)
        
        # Aktualisiere auch die Session mit den HTML-Dateien
        if message.sender == "user":
            sessions[session_id]["last_message"] = message.content
            sessions[session_id]["timestamp"] = new_message["timestamp"]
        
        return new_message
    else:
        # Session existiert nicht oder gehört nicht zum Benutzer
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session nicht gefunden oder keine Berechtigung"
        )

class UpdateSessionRequest(BaseModel):
    last_message: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

@app.put("/sessions/{session_id}", response_model=BackendSession)
async def update_session(session_id: str, session_update: UpdateSessionRequest, current_user: User = Depends(get_current_user)):
    """
    Updates an existing session or creates a new one if it doesn't exist.
    """
    logger.info(f"PUT /sessions/{session_id} endpoint called for user {current_user.id}")
    
    # Prüfe, ob die Session existiert und zum Benutzer gehört
    if session_id in sessions:
        if sessions[session_id].get("user_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Keine Berechtigung für diese Session"
            )
    else:
        # Erstelle eine neue Session für diesen Benutzer
        sessions[session_id] = {
            "id": session_id,
            "user_id": current_user.id,
            "last_message": "Neue Konversation",
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": [],
            "output_folder": f"user_question_output_{session_id}"
        }
    
    # Aktualisiere die Sitzungsinformationen
    if session_update.last_message is not None:
        sessions[session_id]["last_message"] = session_update.last_message
    
    if session_update.output_folder is not None:
        sessions[session_id]["output_folder"] = session_update.output_folder
    
    if session_update.html_files is not None:
        # Aktualisiere bestehende HTML-Dateien, behalte alle bisherigen bei
        current_html_files = sessions[session_id].get("html_files", [])
        for html_file in session_update.html_files:
            if html_file not in current_html_files:
                current_html_files.append(html_file)
        sessions[session_id]["html_files"] = current_html_files
    
    # Aktualisiere den Zeitstempel
    sessions[session_id]["timestamp"] = datetime.datetime.now().isoformat()
    
    # Zurückgeben der aktualisierten Session
    return BackendSession(
        id=session_id,
        user_id=current_user.id,
        last_message=sessions[session_id].get("last_message"),
        timestamp=sessions[session_id].get("timestamp"),
        html_files=sessions[session_id].get("html_files", []),
        output_folder=sessions[session_id].get("output_folder")
    )

@app.post("/ask", response_model=AskResponse)
async def ask_question(payload: AskRequest, current_user: User = Depends(get_current_user)):
    """
    Receives a user_id, session_id and a question, fetches the session's agent and runs the question.
    Session should be initialized via the /initialize_session endpoint first.
    """
    try:
        logger.info(f"Received request from user {current_user.id}: {payload}")
        
        session_id = payload.session_id
        question = payload.question
        dataset_type = payload.dataset_type
        years = payload.years

        # Prüfe, ob die Session existiert und zum Benutzer gehört
        if session_id in sessions:
            if sessions[session_id].get("user_id") != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Keine Berechtigung für diese Session"
                )
        else:
            # Erstelle eine neue Session für diesen Benutzer
            sessions[session_id] = {
                "id": session_id,
                "user_id": current_user.id,
                "last_message": "Neue Konversation",
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": [],
                "output_folder": f"user_question_output_{session_id}"
            }

        # Retrieve the per-session agent (assuming it's initialized)
        logger.info(f"Getting agent for session {session_id}")
        agent_for_session = get_or_create_agent_for_session(session_id, current_user.id)

        # Run the agent in its own directory
        logger.info("Running agent in directory")
        try:
            response_text, output_directory = run_agent_in_directory(
                agent_for_session,
                question,
                dataset_type, # Pass None for dataset_type as it's already set during initialization
                years,  # Pass None for years as it's already set during initialization
                session_id  # Übergebe die session_id
            )
            logger.info(f"Agent response successful: {response_text[:100]}...")
        except Exception as e:
            logger.error(f"Error running agent in directory: {str(e)}")
            logger.error(traceback.format_exc())
            raise

        # Gather any HTML files that got generated
        logger.info(f"Checking for HTML files in {output_directory}")
        if os.path.exists(output_directory) and os.path.isdir(output_directory):
            # Finde neu erzeugte HTML-Dateien
            html_files = [
                f for f in os.listdir(output_directory)
                if f.lower().endswith(".html")
            ]
            logger.info(f"Found HTML files: {html_files}")
            
            # Bestimme, welche HTML-Dateien neu sind
            if session_id in sessions:
                existing_files = sessions[session_id].get("html_files", [])
                new_html_files = [f for f in html_files if f not in existing_files]
            else:
                new_html_files = html_files
        else:
            logger.warning(f"Output directory not found: {output_directory}")
            html_files = []
            new_html_files = []

        output_folder_name = os.path.basename(output_directory)
        logger.info(f"Returning response with output folder: {output_folder_name}")

        # Speichere die Assistentenantwort als Nachricht mit Benutzer-ID
        logger.info(f"Saving assistant message to session {session_id} for user {current_user.id}")
        if session_id not in session_messages:
            session_messages[session_id] = []
            
        new_message = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,  # Setze Benutzer-ID in der Nachricht
            "content": response_text,
            "sender": "assistant",
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": new_html_files,  # Nur die NEUEN HTML-Dateien dieser Nachricht zuordnen
            "output_folder": output_folder_name
        }
        session_messages[session_id].append(new_message)

        # Aktualisiere auch die Session mit den HTML-Dateien und Benutzer-ID
        if session_id in sessions:
            sessions[session_id]["html_files"] = html_files  # Alle HTML-Dateien für die NavBar
            # Stelle sicher, dass die Benutzer-ID gesetzt ist
            if "user_id" not in sessions[session_id]:
                sessions[session_id]["user_id"] = current_user.id
        else:
            # Initialisiere die Session, falls sie noch nicht existiert
            sessions[session_id] = {
                "id": session_id,
                "user_id": current_user.id,
                "last_message": question,
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": html_files,
                "output_folder": output_folder_name
            }

        # Gib die aktuell gefundenen HTML-Dateien zurück
        # Die vollständige Liste wird vom Frontend bei Bedarf abgerufen
        response = AskResponse(
            answer=response_text,
            output_folder=output_folder_name,
            html_files=html_files  # Alle HTML-Dateien zurückgeben für die Session-Aktualisierung
        )
        logger.debug(f"Response object: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}")
        logger.error(traceback.format_exc())
        raise

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000) 