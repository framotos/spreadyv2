import os
import uuid
import shutil
import traceback
import logging
import datetime
from typing import List, Optional, Dict

import pandas as pd
import plotly.express as px
from fastapi import FastAPI, Body, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn 

from smolagents import CodeAgent, OpenAIServerModel
from smolagents.agents import PromptTemplates
from smolagents.agents import PlanningPromptTemplate, ManagedAgentPromptTemplate, FinalAnswerPromptTemplate
from prompts import generate_prompt, SYSTEM_PROMPT

from dotenv import load_dotenv

# Konfiguriere Logging
logging.basicConfig(
    level=logging.DEBUG,
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

# Load environment variables from .env file
load_dotenv()
GEMNINI_APIKEY = os.getenv("GEMNINI_APIKEY")
logger.info(f"API Key (first 5 chars): {GEMNINI_APIKEY[:5] if GEMNINI_APIKEY else 'None'}")

# Speichern von Sitzungsinformationen
user_agents = {}
sessions = {}  # Speichert Sitzungsinformationen: ID, letzter Zeitstempel, HTML-Dateien, Ausgabeordner

BALANCE_DATASET_FILENAME = "balance_data_2020_2023.csv"
INCOME_DATASET_FILENAME = "income_data_2020_2023.csv"


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
    last_message: Optional[str] = None
    timestamp: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

# Create a helper to ensure each session has its own agent
def get_or_create_agent_for_session(session_id: str) -> CodeAgent:
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
                api_key=GEMNINI_APIKEY,
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
                prompt_templates=prompt_templates,
                verbosity_level=1
            )
            logger.debug("CodeAgent created")
            
            user_agents[session_id] = agent
            
            # Initialisiere Sitzungsinformationen
            if session_id not in sessions:
                output_dir_name = f"user_question_output_{session_id[:4]}"
                sessions[session_id] = {
                    "id": session_id,
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
    dataset_type: Optional[str], # Added dataset_type
    years: Optional[List[int]],    # Added years
    session_id: str,  # Session-ID hinzugefügt
    balance_dataset_filename: str = BALANCE_DATASET_FILENAME,
    income_dataset_filename: str = INCOME_DATASET_FILENAME,
    base_output_dir: str = "user_output"
) -> (str, str):
    """
    Runs the agent in a specific directory, copies the dataset,
    and ensures outputs are saved there.
    Returns:
        str: The agent's response (text).
        str: The path to the output directory where files are saved.
    """
    try:
        logger.info(f"Running agent with question: {user_question}")
        logger.info(f"Dataset type: {dataset_type}, Years: {years}")
        
        original_working_directory = os.getcwd()
        
        # Verwende den Output-Ordner aus der Session, falls vorhanden, oder erstelle einen neuen
        if session_id in sessions and "output_folder" in sessions[session_id]:
            output_folder_name = sessions[session_id]["output_folder"]
        else:
            output_folder_name = f"user_question_output_{session_id[:4]}"
        
        output_dir_name = f"{base_output_dir}/{output_folder_name}"
        output_directory = os.path.join(original_working_directory, output_dir_name)
        os.makedirs(output_directory, exist_ok=True)

        # Copy dataset file(s) based on dataset_type
        dataset_filenames_to_copy = []
        if dataset_type == "income":
            dataset_filenames_to_copy = [income_dataset_filename]
        elif dataset_type == "balance":
            dataset_filenames_to_copy = [balance_dataset_filename]
        else:
            dataset_filenames_to_copy = [balance_dataset_filename, income_dataset_filename]

        for filename in dataset_filenames_to_copy:
            dataset_source_path = os.path.join(original_working_directory, "data", filename)
            dataset_destination_path = os.path.join(output_directory, filename)
            if os.path.exists(dataset_source_path):
                logger.info(f"Copying dataset from {dataset_source_path} to {dataset_destination_path}")
                shutil.copy2(dataset_source_path, dataset_destination_path)
            else:
                logger.error(f"Dataset file not found: {dataset_source_path}")
                
        dataset_description = generate_prompt(dataset_type, years)

        prompt = f"""This is the user question: {user_question}\n\n{dataset_description}.\n\nYou can find the dataset in this directory: {output_dir_name}. If you are asked to create any graphs save them via also in your user directory: {output_dir_name} as in fig.write_html("{output_dir_name}/your_name_for_the_graph.html") """
        logger.debug(f"Generated prompt: {prompt}")

        # Note the `reset=False` so it keeps track of conversation for that session
        logger.info("Running agent with prompt")
        try:
            response_chart = agent.run(prompt, reset=False)
            logger.info(f"Agent response: {response_chart[:100]}...")
        except Exception as e:
            logger.error(f"Error in agent.run: {str(e)}")
            logger.error(f"Error details: {traceback.format_exc()}")
            raise

        return response_chart, output_directory
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the user_output directory as static so HTML files can be served directly
app.mount("/user_output", StaticFiles(directory="user_output"), name="user_output")

@app.get("/sessions")
def get_sessions():
    """
    Returns a list of all sessions.
    """
    logger.info("GET /sessions endpoint called")
    return [
        BackendSession(
            id=session_id,
            last_message=session_data.get("last_message", "Neue Konversation"),
            timestamp=session_data.get("timestamp", datetime.datetime.now().isoformat()),
            html_files=session_data.get("html_files", []),
            output_folder=session_data.get("output_folder")
        ) 
        for session_id, session_data in sessions.items()
    ]

class UpdateSessionRequest(BaseModel):
    last_message: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

@app.put("/sessions/{session_id}", response_model=BackendSession)
def update_session(session_id: str, session_update: UpdateSessionRequest):
    """
    Updates an existing session or creates a new one if it doesn't exist.
    """
    logger.info(f"PUT /sessions/{session_id} endpoint called with data: {session_update}")
    
    # Erstelle eine neue Session, falls sie noch nicht existiert
    if session_id not in sessions:
        sessions[session_id] = {
            "id": session_id,
            "last_message": "Neue Konversation",
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": [],
            "output_folder": f"user_question_output_{session_id[:4]}"
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
        last_message=sessions[session_id].get("last_message"),
        timestamp=sessions[session_id].get("timestamp"),
        html_files=sessions[session_id].get("html_files", []),
        output_folder=sessions[session_id].get("output_folder")
    )

@app.post("/ask", response_model=AskResponse)
def ask_question(payload: AskRequest):
    """
    Receives a user_id, session_id and a question, fetches the session's agent and runs the question.
    Session should be initialized via the /initialize_session endpoint first.
    """
    try:
        logger.info(f"Received request: {payload}")
        # Log the request payload in detail
        logger.debug(f"Request payload details - session_id: {payload.session_id}, question: {payload.question}, dataset_type: {payload.dataset_type}, years: {payload.years}")
        
        session_id = payload.session_id
        question = payload.question
        dataset_type = payload.dataset_type
        years = payload.years

        # Retrieve the per-session agent (assuming it's initialized)
        logger.info(f"Getting agent for session {session_id}")
        agent_for_session = get_or_create_agent_for_session(session_id) # Filters are None here as agent is already initialized

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
            html_files = [
                f for f in os.listdir(output_directory)
                if f.lower().endswith(".html")
            ]
            logger.info(f"Found HTML files: {html_files}")
        else:
            logger.warning(f"Output directory not found: {output_directory}")
            html_files = []

        output_folder_name = os.path.basename(output_directory)
        logger.info(f"Returning response with output folder: {output_folder_name}")

        # Sitzungsinformationen werden jetzt über den /sessions/{session_id} Endpunkt aktualisiert
        # Die Frontend-Komponente wird die Session aktualisieren, nachdem sie die Antwort erhalten hat

        # Gib die aktuell gefundenen HTML-Dateien zurück
        # Die vollständige Liste wird vom Frontend bei Bedarf abgerufen
        response = AskResponse(
            answer=response_text,
            output_folder=output_folder_name,
            html_files=html_files  # Nur die neuen Dateien zurückgeben
        )
        logger.debug(f"Response object: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}")
        logger.error(traceback.format_exc())
        raise

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000) 