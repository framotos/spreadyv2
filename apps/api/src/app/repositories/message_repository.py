import datetime
import uuid
from typing import List, Dict, Optional, Any
from abc import ABC, abstractmethod

from ..models.message import Message
from .base import BaseRepository

class MessageRepository(BaseRepository[Message]):
    """
    Repository interface for message management.
    """
    
    @abstractmethod
    async def get_by_session_id(self, session_id: str, user_id: str) -> List[Message]:
        """
        Get all messages for a session.
        
        Args:
            session_id: The session ID
            user_id: The user ID to filter messages by
            
        Returns:
            List of messages belonging to the session and user
        """
        pass
    
    @abstractmethod
    async def add_message(self, session_id: str, user_id: str, content: str, sender: str, 
                         html_files: List[str] = None, output_folder: str = None) -> Message:
        """
        Add a message to a session.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            content: The message content
            sender: The message sender ('user' or 'assistant')
            html_files: Optional list of HTML files associated with the message
            output_folder: Optional output folder for the message
            
        Returns:
            The created message
        """
        pass
    
    @abstractmethod
    async def add_welcome_message(self, session_id: str, user_id: str, output_folder: str = None) -> Message:
        """
        Add a welcome message to a new session.
        
        Args:
            session_id: The session ID
            user_id: The user ID
            output_folder: Optional output folder for the message
            
        Returns:
            The created welcome message
        """
        pass

class InMemoryMessageRepository(MessageRepository):
    """
    In-memory implementation of the message repository.
    """
    
    def __init__(self):
        self.messages: Dict[str, List[Dict[str, Any]]] = {}
    
    async def get_by_id(self, id: str) -> Optional[Message]:
        # This method is less useful for messages, but implemented for interface compliance
        for session_messages in self.messages.values():
            for message in session_messages:
                if message.get("id") == id:
                    return Message(**message)
        return None
    
    async def create(self, entity: Message) -> Message:
        # This method is less useful for messages, but implemented for interface compliance
        # We would need a session_id to properly store the message
        raise NotImplementedError("Use add_message instead")
    
    async def update(self, id: str, data: dict) -> Optional[Message]:
        # Messages are generally not updated, but implemented for interface compliance
        for session_id, session_messages in self.messages.items():
            for i, message in enumerate(session_messages):
                if message.get("id") == id:
                    self.messages[session_id][i].update(data)
                    return Message(**self.messages[session_id][i])
        return None
    
    async def delete(self, id: str) -> bool:
        # Messages are generally not deleted, but implemented for interface compliance
        for session_id, session_messages in self.messages.items():
            for i, message in enumerate(session_messages):
                if message.get("id") == id:
                    self.messages[session_id].pop(i)
                    return True
        return False
    
    async def get_by_session_id(self, session_id: str, user_id: str) -> List[Message]:
        if session_id not in self.messages:
            # Return empty list if session doesn't exist
            return []
        
        # Filter messages by user_id
        user_messages = [
            Message(**msg) for msg in self.messages[session_id]
            if msg.get("user_id") == user_id
        ]
        
        return user_messages
    
    async def add_message(self, session_id: str, user_id: str, content: str, sender: str, 
                         html_files: List[str] = None, output_folder: str = None) -> Message:
        if session_id not in self.messages:
            self.messages[session_id] = []
        
        # Create new message
        new_message = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "content": content,
            "sender": sender,
            "timestamp": datetime.datetime.now().isoformat(),
            "html_files": html_files or [],
            "output_folder": output_folder or ""
        }
        
        # Add message to session
        self.messages[session_id].append(new_message)
        
        return Message(**new_message)
    
    async def add_welcome_message(self, session_id: str, user_id: str, output_folder: str = None) -> Message:
        welcome_content = "Hallo! Ich bin dein Finanzanalyst. Wie kann ich dir heute helfen?"
        
        return await self.add_message(
            session_id=session_id,
            user_id=user_id,
            content=welcome_content,
            sender="assistant",
            html_files=[],
            output_folder=output_folder
        ) 