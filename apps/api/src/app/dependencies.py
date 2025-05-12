"""
Dependencies for FastAPI dependency injection.
"""
import os
from typing import Annotated
from fastapi import Depends

from .repositories.session_repository import SessionRepository, InMemorySessionRepository
from .repositories.message_repository import MessageRepository, InMemoryMessageRepository
from .repositories.agent_repository import AgentRepository, InMemoryAgentRepository
from .services.data_service import DataService
from .services.agent_service import AgentService

# Singleton instances
_session_repository: SessionRepository = InMemorySessionRepository()
_message_repository: MessageRepository = InMemoryMessageRepository()
_agent_repository: AgentRepository = InMemoryAgentRepository()
_data_service: DataService = DataService(data_dir=os.path.join(os.getcwd(), "apps/api/data"))
_agent_service: AgentService = AgentService(
    agent_repository=_agent_repository,
    session_repository=_session_repository,
    data_service=_data_service
)

# Dependency providers
def get_session_repository() -> SessionRepository:
    """
    Get the session repository.
    
    Returns:
        The session repository instance
    """
    return _session_repository

def get_message_repository() -> MessageRepository:
    """
    Get the message repository.
    
    Returns:
        The message repository instance
    """
    return _message_repository

def get_agent_repository() -> AgentRepository:
    """
    Get the agent repository.
    
    Returns:
        The agent repository instance
    """
    return _agent_repository

def get_data_service() -> DataService:
    """
    Get the data service.
    
    Returns:
        The data service instance
    """
    return _data_service

def get_agent_service() -> AgentService:
    """
    Get the agent service.
    
    Returns:
        The agent service instance
    """
    return _agent_service

# Type annotations for FastAPI dependencies
SessionRepositoryDep = Annotated[SessionRepository, Depends(get_session_repository)]
MessageRepositoryDep = Annotated[MessageRepository, Depends(get_message_repository)]
AgentRepositoryDep = Annotated[AgentRepository, Depends(get_agent_repository)]
DataServiceDep = Annotated[DataService, Depends(get_data_service)]
AgentServiceDep = Annotated[AgentService, Depends(get_agent_service)] 