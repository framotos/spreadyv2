from typing import List
from pydantic import BaseModel

class AskRequest(BaseModel):
    """
    Request model for asking a question.
    """
    session_id: str
    question: str

class AskResponse(BaseModel):
    """
    Response model for an ask request.
    """
    answer: str
    output_folder: str
    html_files: List[str] 