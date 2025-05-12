import os
import logging
from typing import Tuple

from neurofinance_agents import FinanceAgent

from ..core.config import settings
from .. import prompts
from ..repositories.agent_repository import AgentRepository
from ..repositories.session_repository import SessionRepository
from .data_service import DataService

logger = logging.getLogger(__name__)

class AgentService:
    """
    Service for interacting with agents.
    """
    
    def __init__(
        self, 
        agent_repository: AgentRepository,
        session_repository: SessionRepository,
        data_service: DataService
    ):
        """
        Initialize the agent service.
        
        Args:
            agent_repository: Repository for agent management
            session_repository: Repository for session management
            data_service: Service for data access
        """
        self.agent_repository = agent_repository
        self.session_repository = session_repository
        self.data_service = data_service
    
    async def run_agent_query(
        self,
        session_id: str,
        user_id: str,
        question: str
    ) -> Tuple[str, str]:
        """
        Run a query using an agent.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            question: The user's question
            
        Returns:
            A tuple of (response text, output directory)
        """
        logger.info(f"Processing agent query for session {session_id}, user {user_id}")
        
        # Get the agent for the session
        agent = await self.agent_repository.get_agent(session_id, user_id)
        
        # Get the session to determine the output folder
        session = await self.session_repository.get_by_id(session_id)
        if not session:
            # Fallback if session doesn't exist (shouldn't happen with current flow)
            output_folder_name = f"user_question_output_{session_id}"
            logger.warning(f"Session data not found for {session_id} when determining output folder, using default: {output_folder_name}")
        else:
            output_folder_name = session.output_folder or f"user_question_output_{session_id}"
        
        # Run the agent in the output directory
        response_text, output_directory = await self._run_agent_in_directory(
            agent=agent,
            user_question=question,
            session_id=session_id,
            output_folder_name=output_folder_name
        )
        
        return response_text, output_directory
    
    async def _run_agent_in_directory(
        self,
        agent: FinanceAgent,
        user_question: str,
        session_id: str,
        output_folder_name: str
    ) -> Tuple[str, str]:
        """
        Run the agent in a specific directory.
        
        Args:
            agent: The agent instance
            user_question: The user's question
            session_id: The session ID
            output_folder_name: The output folder name
            
        Returns:
            A tuple of (response text, output directory)
        """
        try:
            logger.info(f"Agent execution started for session {session_id}")
            original_working_directory = os.getcwd()
            base_output_dir = settings.BASE_OUTPUT_DIR

            output_dir_name_rel = os.path.join(base_output_dir, output_folder_name)
            output_directory = os.path.join(original_working_directory, output_dir_name_rel)
            os.makedirs(output_directory, exist_ok=True)
            logger.info(f"Ensured output directory exists: {output_directory}")

            # Generate dataset description
            dataset_identifier_for_prompt = "balance_income_info"
            logger.info(f"Generating dataset description using identifier: {dataset_identifier_for_prompt}")
            dataset_description = prompts.generate_prompt(dataset_identifier_for_prompt, None)

            # Use the agent's run method with our parameters
            logger.info("Invoking agent.run()")
            response_text = agent.run(
                question=user_question,
                output_dir=output_dir_name_rel,
                dataset_description=dataset_description
            )
            logger.info(f"Agent execution completed for session {session_id}. Response length: {len(response_text)}")

            return response_text, output_directory

        except FileNotFoundError as e:
            logger.error(f"File not found error: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Error during agent execution for session {session_id}: {str(e)}", exc_info=True)
            raise RuntimeError(f"Agent execution failed: {str(e)}") from e 