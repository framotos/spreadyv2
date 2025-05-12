from typing import Dict, Optional, Any
from abc import ABC, abstractmethod

# Import FinanceAgent instead of CodeAgent
from neurofinance_agents import FinanceAgent

from ..core.config import settings
from .. import prompts

class AgentRepository(ABC):
    """
    Repository interface for agent management.
    """
    
    @abstractmethod
    async def get_agent(self, session_id: str, user_id: str) -> FinanceAgent:
        """
        Get or create an agent for a session.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            
        Returns:
            The agent instance
        """
        pass
    
    @abstractmethod
    async def reset_agent(self, session_id: str) -> bool:
        """
        Reset an agent for a session.
        
        Args:
            session_id: The session ID
            
        Returns:
            True if reset, False otherwise
        """
        pass

class InMemoryAgentRepository(AgentRepository):
    """
    In-memory implementation of the agent repository.
    """
    
    def __init__(self):
        self.agents: Dict[str, FinanceAgent] = {}
    
    async def get_agent(self, session_id: str, user_id: str) -> FinanceAgent:
        if session_id not in self.agents:
            # Create new agent using FinanceAgent
            self.agents[session_id] = FinanceAgent(
                api_key=settings.GEMNINI_APIKEY,
                api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
                model_id="gemini-2.0-flash-exp",
                verbosity_level=1
            )
        
        return self.agents[session_id]
    
    async def reset_agent(self, session_id: str) -> bool:
        if session_id not in self.agents:
            return False
        
        # Remove the agent from the repository
        del self.agents[session_id]
        return True 