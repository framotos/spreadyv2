import os
import uuid
import shutil
from typing import List, Optional

import pandas as pd
import plotly.express as px
from fastapi import FastAPI, Body
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn 

from smolagents import CodeAgent, OpenAIServerModel
from prompts import generate_prompt, SYSTEM_PROMPT

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
GEMNINI_APIKEY = os.getenv("GEMNINI_APIKEY")

user_agents = {}

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

# Create a helper to ensure each session has its own agent
def get_or_create_agent_for_session(session_id: str) -> CodeAgent:
    """
    Returns the CodeAgent associated with session_id.
    If none exists, it creates a new agent instance and stores it.
    """
    if session_id not in user_agents:
        # Create a new agent for this session
        user_agents[session_id] = CodeAgent(
            tools=[],  # Tools can be added as needed
            model=OpenAIServerModel(
                model_id="gemini-2.0-flash-exp",
                api_key=GEMNINI_APIKEY,
                api_base="https://generativelanguage.googleapis.com/v1beta/openai/"
            ),
            additional_authorized_imports=["pandas", "plotly", "numpy"],
            system_prompt=SYSTEM_PROMPT,
            verbosity_level=1
        )
    return user_agents[session_id]

def run_agent_in_directory(
    agent: CodeAgent,
    user_question: str,
    dataset_type: Optional[str], # Added dataset_type
    years: Optional[List[int]],    # Added years
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
    original_working_directory = os.getcwd()
    output_dir_name = f"{base_output_dir}/user_question_output_" + str(uuid.uuid4())[:4]
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
            shutil.copy2(dataset_source_path, dataset_destination_path)
            
    dataset_description = generate_prompt(dataset_type, years)


    prompt = f"""This is the user question: {user_question}\n\n{dataset_description}.\n\nYou can find the dataset in this directory: {output_dir_name}. If you are asked to create any graphs save them via also in your user directory: {output_dir_name} as in fig.write_html("{output_dir_name}/your_name_for_the_graph.html") """

    # Note the `reset=False` so it keeps track of conversation for that session
    response_chart = agent.run(prompt, reset=False)

    return response_chart, output_directory

# ---- FASTAPI SETUP ----
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the user_output directory as static so HTML files can be served directly
app.mount("/user_output", StaticFiles(directory="user_output"), name="user_output")

@app.post("/ask", response_model=AskResponse)
def ask_question(payload: AskRequest):
    """
    Receives a user_id, session_id and a question, fetches the session's agent and runs the question.
    Session should be initialized via the /initialize_session endpoint first.
    """
    session_id = payload.session_id
    question = payload.question
    dataset_type = payload.dataset_type
    years = payload.years

    # Retrieve the per-session agent (assuming it's initialized)
    agent_for_session = get_or_create_agent_for_session(session_id) # Filters are None here as agent is already initialized

    # Run the agent in its own directory
    response_text, output_directory = run_agent_in_directory(
        agent_for_session,
        question,
        dataset_type, # Pass None for dataset_type as it's already set during initialization
        years  # Pass None for years as it's already set during initialization
    )

    # Gather any HTML files that got generated
    if os.path.exists(output_directory) and os.path.isdir(output_directory):
        html_files = [
            f for f in os.listdir(output_directory)
            if f.lower().endswith(".html")
        ]
    else:
        html_files = []

    output_folder_name = os.path.basename(output_directory)

    return AskResponse(
        answer=response_text,
        output_folder=output_folder_name,
        html_files=html_files
    )
    
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)