from typing import List, Optional
from pydantic import BaseModel

class BackendSession(BaseModel):
    """
    Represents a session in the backend.
    """
    id: str
    user_id: Optional[str] = None
    last_message: Optional[str] = None
    timestamp: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None

class UpdateSessionRequest(BaseModel):
    """
    Request model for updating a session.
    """
    last_message: Optional[str] = None
    html_files: Optional[List[str]] = None
    output_folder: Optional[str] = None 