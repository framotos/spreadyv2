from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class CodeGenerationResult(Enum):
    SUCCESS = "success"
    FAILED_ERROR = "failed_error"
    FAILED_EVALUATION = "failed_evaluation"


class CodeGenerationOutput(BaseModel):
    result: CodeGenerationResult
    raw_code: Optional[str]
    output: Optional[str]
    feedback: Optional[str]
    error: Optional[str]


class QueryRequest(BaseModel):
    user_id: str
    user_query: str
    dataset_option: str


class QueryResponse(BaseModel):
    answer: str
    image_urls: List[str]
    image_labels: List[str]
    image_urls_without_https: List[str]
    table_urls: List[str]
    table_labels: List[str]
    table_urls_without_https: List[str]

class AnswerResponse(BaseModel):
    answer: str
    code: Optional[str]
    output: Optional[str]


# Pydantic model for file upload response
class FileUploadResponse(BaseModel):
    message: str
    file_name: str


class DatasetsResponse(BaseModel):
    datasets: List[str]


class Status(BaseModel):
    status: str
    message: str
    file_content: dict = None
    deleted: bool = None


class FileNotFoundError(Exception):
    pass


class CSVUploadResponse(BaseModel):
    message: str
    file_name: Optional[str] = None
    status_code: int
