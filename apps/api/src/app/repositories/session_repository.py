import datetime
import uuid
from typing import List, Dict, Optional, Any
from abc import ABC, abstractmethod

from ..models.session import BackendSession
from .base import BaseRepository

class SessionRepository(BaseRepository[BackendSession]):
    """
    Repository interface for session management.
    """
    
    @abstractmethod
    async def get_by_user_id(self, user_id: str) -> List[BackendSession]:
        """
        Get all sessions for a user.
        
        Args:
            user_id: The user ID
            
        Returns:
            List of sessions belonging to the user
        """
        pass
    
    @abstractmethod
    async def create_or_update(self, session_id: str, user_id: str, data: dict) -> BackendSession:
        """
        Create a new session or update an existing one.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            data: The session data
            
        Returns:
            The created or updated session
        """
        pass
    
    @abstractmethod
    async def belongs_to_user(self, session_id: str, user_id: str) -> bool:
        """
        Check if a session belongs to a user.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            
        Returns:
            True if the session belongs to the user, False otherwise
        """
        pass

class InMemorySessionRepository(SessionRepository):
    """
    In-memory implementation of the session repository.
    """
    
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    async def get_by_id(self, id: str) -> Optional[BackendSession]:
        if id not in self.sessions:
            return None
        
        session_data = self.sessions[id]
        return BackendSession(**session_data)
    
    async def create(self, entity: BackendSession) -> BackendSession:
        session_dict = entity.model_dump()
        self.sessions[entity.id] = session_dict
        return entity
    
    async def update(self, id: str, data: dict) -> Optional[BackendSession]:
        if id not in self.sessions:
            return None
        
        self.sessions[id].update(data)
        self.sessions[id]["updated_at"] = datetime.datetime.now().isoformat()
        
        return BackendSession(**self.sessions[id])
    
    async def delete(self, id: str) -> bool:
        if id not in self.sessions:
            return False
        
        del self.sessions[id]
        return True
    
    async def get_by_user_id(self, user_id: str) -> List[BackendSession]:
        user_sessions = [
            BackendSession(**session_data)
            for session_id, session_data in self.sessions.items()
            if session_data.get("user_id") == user_id
        ]
        
        return user_sessions
    
    async def create_or_update(self, session_id: str, user_id: str, data: dict) -> BackendSession:
        if session_id in self.sessions:
            if self.sessions[session_id].get("user_id") != user_id:
                # Session exists but belongs to another user
                raise ValueError(f"Session {session_id} belongs to another user")
            
            # Update existing session
            self.sessions[session_id].update(data)
            self.sessions[session_id]["updated_at"] = datetime.datetime.now().isoformat()
        else:
            # Create new session
            self.sessions[session_id] = {
                "id": session_id,
                "user_id": user_id,
                "last_message": data.get("last_message", "Neue Konversation"),
                "timestamp": datetime.datetime.now().isoformat(),
                "html_files": data.get("html_files", []),
                "output_folder": data.get("output_folder", f"user_question_output_{session_id}")
            }
        
        return BackendSession(**self.sessions[session_id])
    
    async def belongs_to_user(self, session_id: str, user_id: str) -> bool:
        if session_id not in self.sessions:
            return False
        
        return self.sessions[session_id].get("user_id") == user_id 