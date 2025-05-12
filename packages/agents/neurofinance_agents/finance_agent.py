"""
Finance agent for NeuroFinance.
"""

import os
import logging
from typing import Dict, List, Optional, Any, Tuple

from smolagents import CodeAgent, OpenAIServerModel
from smolagents.agents import PromptTemplates
from smolagents.agents import PlanningPromptTemplate, ManagedAgentPromptTemplate, FinalAnswerPromptTemplate

from .prompt_templates import get_system_prompt, generate_finance_prompt
from .tools import get_finance_tools

logger = logging.getLogger(__name__)

class FinanceAgent:
    """
    Finance agent for NeuroFinance.
    
    This agent is specialized for financial analysis tasks and wraps the CodeAgent
    from smolagents with finance-specific functionality.
    """
    
    def __init__(
        self,
        api_key: str,
        api_base: str = "https://generativelanguage.googleapis.com/v1beta/openai/",
        model_id: str = "gemini-2.0-flash-exp",
        verbosity_level: int = 2
    ):
        """
        Initialize the finance agent.
        
        Args:
            api_key: The API key for the LLM service
            api_base: The API base URL for the LLM service
            model_id: The model ID to use
            verbosity_level: The verbosity level for the agent (0-2)
        """
        self.api_key = api_key
        self.api_base = api_base
        self.model_id = model_id
        self.verbosity_level = verbosity_level
        self._agent = self._create_agent()
        
    def _create_agent(self) -> CodeAgent:
        """
        Create the underlying code agent.
        
        Returns:
            The code agent instance
        """
        model = OpenAIServerModel(
            model_id=self.model_id,
            api_key=self.api_key,
            api_base=self.api_base
        )
        
        prompt_templates = PromptTemplates(
            system_prompt=get_system_prompt(),
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
            tools=get_finance_tools(),
            model=model,
            additional_authorized_imports=["pandas", "plotly", "numpy"],
            prompt_templates=prompt_templates,
            verbosity_level=self.verbosity_level
        )
        
        return agent
    
    def run(
        self, 
        question: str, 
        output_dir: str,
        dataset_description: str = None,
        reset: bool = False
    ) -> str:
        """
        Run the finance agent to answer a question.
        
        Args:
            question: The user's question
            output_dir: The output directory for visualizations
            dataset_description: Optional description of the dataset
            reset: Whether to reset the agent's conversation history
            
        Returns:
            The agent's response
        """
        # Create the prompt for the agent
        prompt = self._create_prompt(question, output_dir, dataset_description)
        
        # Log the agent execution
        logger.info(f"Running finance agent with question: {question[:50]}...")
        
        try:
            # Run the agent
            response = self._agent.run(prompt, reset=reset)
            logger.info(f"Finance agent execution completed. Response length: {len(response)}")
            return response
        except Exception as e:
            logger.error(f"Error during finance agent execution: {str(e)}", exc_info=True)
            raise RuntimeError(f"Finance agent execution failed: {str(e)}") from e
    
    def _create_prompt(self, question: str, output_dir: str, dataset_description: str = None) -> str:
        """
        Create the prompt for the agent.
        
        Args:
            question: The user's question
            output_dir: The output directory for visualizations
            dataset_description: Optional description of the dataset
            
        Returns:
            The prompt for the agent
        """
        # Generate the finance prompt
        prompt = generate_finance_prompt(
            question=question,
            output_dir=output_dir,
            dataset_description=dataset_description
        )
        
        logger.debug(f"Generated prompt for agent: {prompt[:200]}...")
        return prompt
    
    def reset(self) -> None:
        """
        Reset the agent's conversation history.
        """
        # Re-create the agent to reset its state
        self._agent = self._create_agent()
        logger.info("Finance agent reset.")
    
    def save_state(self, state_dir: str) -> str:
        """
        Save the agent's state to a file.
        
        Args:
            state_dir: The directory to save the state to
            
        Returns:
            The path to the saved state file
        """
        # Currently not implemented as smolagents doesn't support state saving
        # This is a placeholder for future implementation
        logger.warning("Agent state saving is not yet implemented.")
        return ""
    
    def load_state(self, state_path: str) -> bool:
        """
        Load the agent's state from a file.
        
        Args:
            state_path: The path to the state file
            
        Returns:
            True if the state was loaded successfully, False otherwise
        """
        # Currently not implemented as smolagents doesn't support state loading
        # This is a placeholder for future implementation
        logger.warning("Agent state loading is not yet implemented.")
        return False 