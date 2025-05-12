from typing import List, Optional
from pydantic import BaseModel

class Message(BaseModel):
    """
    Represents a message in a chat session.
    """
    id: str
    user_id: Optional[str] = None 
    content: str
    sender: str  # 'user' or 'assistant'
    timestamp: str
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

class AddMessageRequest(BaseModel):
    """
    Request model for adding a message to a session.
    """
    content: str
    sender: str
    # user_id is implicitly the current_user.id, handled by the service
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None 