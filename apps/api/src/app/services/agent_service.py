import os
import shutil
import traceback
import logging
from typing import List, Optional, Dict, Any, Tuple

from smolagents import CodeAgent, OpenAIServerModel
from smolagents.agents import PromptTemplates
from smolagents.agents import PlanningPromptTemplate, ManagedAgentPromptTemplate, FinalAnswerPromptTemplate

# Assuming settings are available
from ..core.config import settings 
# Assuming prompts are now structured differently or need adjustment
# We keep the import for now, but the implementation might change
from .. import prompts # Use relative import within the 'app' package

logger = logging.getLogger(__name__)

# --- Global state (temporary - should be managed properly) ---
# TODO: Refactor agent/session state management 
user_agents: Dict[str, CodeAgent] = {}
# REMOVED: Filename constants are no longer needed here if we query DB
# BALANCE_INFO_FILENAME = ...
# INCOME_INFO_FILENAME = ...
# BALANCE_INCOME_INFO_FILENAME = ...

# --- Helper Functions (Moved from debug_main.py) ---

def _get_or_create_agent(session_id: str, user_id: Optional[str] = None) -> CodeAgent:
    """
    Internal helper to get/create an agent instance for a session.
    """
    if session_id not in user_agents:
        logger.info(f"Creating new agent instance for session {session_id} (user: {user_id})")
        try:
            model = OpenAIServerModel(
                model_id="gemini-2.0-flash-exp",
                api_key=settings.GEMNINI_APIKEY,
                api_base="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
            
            # Use prompt structure from the prompts module
            prompt_templates = PromptTemplates(
                system_prompt=prompts.SYSTEM_PROMPT,
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
            
            agent = CodeAgent(
                tools=[], # Tools can be added as needed
                model=model,
                additional_authorized_imports=["pandas", "plotly", "numpy"],
                prompt_templates=prompt_templates,
                verbosity_level=1 # Consider making this configurable
            )
            user_agents[session_id] = agent
            logger.info(f"Agent created successfully for session {session_id}")
        except Exception as e:
            logger.error(f"Error creating agent for session {session_id}: {str(e)}", exc_info=True)
            # Re-raise the exception to be handled by the calling endpoint
            raise RuntimeError(f"Failed to create agent instance: {str(e)}") from e
            
    return user_agents[session_id]

def _run_agent_in_directory(
    agent: CodeAgent,
    user_question: str,
    session_id: str, # Needed for output directory
    output_folder_name: str # Determined by caller (ask router)
) -> Tuple[str, str]:
    """
    Internal helper to run the agent in a specific directory.
    Assumes output_folder_name is provided.
    Returns the agent's text response and the full output directory path.
    REMOVED: CSV selection and copying logic.
    MODIFIED: Prompt generation assumes combined data is always available.
    """
    try:
        logger.info(f"Agent execution started for session {session_id}")
        original_working_directory = os.getcwd()
        base_output_dir = settings.BASE_OUTPUT_DIR

        output_dir_name_rel = os.path.join(base_output_dir, output_folder_name)
        output_directory = os.path.join(original_working_directory, output_dir_name_rel)
        os.makedirs(output_directory, exist_ok=True)
        logger.info(f"Ensured output directory exists: {output_directory}")

        # --- REMOVED Dataset File Selection & Copying --- 
        # No longer needed as data will come from DB
        logger.info("Skipping CSV file selection and copying; data will be sourced from database.")

        # --- Generate dataset description --- 
        # Always generate the description for the combined dataset
        dataset_identifier_for_prompt = "balance_income_info" # Always use combined identifier
        logger.info(f"Generating dataset description using identifier: {dataset_identifier_for_prompt}")
        dataset_description = prompts.generate_prompt(dataset_identifier_for_prompt, None)

        # --- Create the prompt text ---
        # REMOVED: Reference to specific CSV files.
        # MODIFIED: Describe the conceptual data availability.
        agent_output_dir_path = output_dir_name_rel.replace("\\", "/") 
        # TODO: The description of data access needs refinement once DB query method is decided.
        # Example: Tell agent data is in a pandas dataframe named 'df' or accessible via SQL.
        prompt = (
            f"This is the user question: {user_question}\n\n"
            f"{dataset_description}\n\n"
            f"The relevant financial data (combined income statement and balance sheet figures) is available for your analysis. " 
            f"Please proceed with the analysis based on the user question and the described data structure.\n\n"
            f"If you are asked to create any graphs save them also in your user directory: '{agent_output_dir_path}' like this: "
            f"`fig.write_html(\"{agent_output_dir_path}/your_name_for_the_graph.html\")`.\n"
        )
        logger.debug(f"Generated prompt for agent: {prompt[:200]}...")
        # --- END PROMPT TEXT ---

        # Run the agent
        logger.info("Invoking agent.run()")
        response_text = agent.run(prompt, reset=False) # Keep conversation history
        logger.info(f"Agent execution completed for session {session_id}. Response length: {len(response_text)}")

        return response_text, output_directory

    except FileNotFoundError as e:
        logger.error(f"Dataset copying failed: {str(e)}", exc_info=True)
        raise # Re-raise FileNotFoundError to be caught by the endpoint handler
    except Exception as e:
        logger.error(f"Error during agent execution in directory for session {session_id}: {str(e)}", exc_info=True)
        # Wrap other exceptions in a generic runtime error
        raise RuntimeError(f"Agent execution failed: {str(e)}") from e

# --- Public Service Function --- 

async def run_agent_query(
    session_id: str,
    user_id: str,
    question: str
) -> Tuple[str, str]:
    """
    Main service function to handle an '/ask' request.
    Gets the agent, determines the output folder, and runs the agent.
    Returns the agent's text response and the full output directory path.
    """
    logger.info(f"Processing agent query for session {session_id}, user {user_id}")
    
    # Get or create the agent for the session
    agent = _get_or_create_agent(session_id, user_id)
    
    # Determine output folder name (using logic similar to ask router's implicit creation)
    # TODO: Unify session/output folder management
    from ..routers.sessions import sessions # Temporary import for state access
    if session_id in sessions and "output_folder" in sessions[session_id]:
        output_folder_name = sessions[session_id]["output_folder"]
    else:
        # Fallback if session wasn't implicitly created yet (shouldn't happen with current ask router flow)
        output_folder_name = f"user_question_output_{session_id}"
        logger.warning(f"Session data not found for {session_id} when determining output folder, using default: {output_folder_name}")

    # Run the agent logic in its designated directory
    response_text, output_directory = _run_agent_in_directory(
        agent=agent,
        user_question=question,
        session_id=session_id,
        output_folder_name=output_folder_name
    )
    
    return response_text, output_directory 