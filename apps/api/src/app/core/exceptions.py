"""
Global exception handlers and custom exceptions for the API.

This module defines custom exception classes and FastAPI exception handlers
to ensure consistent error responses following Rule 11.
"""

import logging
from typing import Any, Dict, Optional, Union

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

logger = logging.getLogger(__name__)

# --- Custom Exception Classes ---

class BaseAPIException(Exception):
    """
    Base exception for API errors.
    
    All custom API exceptions should inherit from this class.
    """
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class NotFoundError(BaseAPIException):
    """Exception raised when a resource is not found."""
    
    def __init__(
        self,
        message: str = "Resource not found",
        code: str = "not_found",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )


class ValidationError(BaseAPIException):
    """Exception raised for validation errors."""
    
    def __init__(
        self,
        message: str = "Validation error",
        code: str = "validation_error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class AuthenticationError(BaseAPIException):
    """Exception raised for authentication failures."""
    
    def __init__(
        self,
        message: str = "Authentication failed",
        code: str = "authentication_error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )


class AuthorizationError(BaseAPIException):
    """Exception raised for authorization failures."""
    
    def __init__(
        self,
        message: str = "Not authorized",
        code: str = "authorization_error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )


class RateLimitExceeded(BaseAPIException):
    """Exception raised when rate limits are exceeded."""
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        code: str = "rate_limit_exceeded",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details
        )


class InternalServerError(BaseAPIException):
    """Exception raised for internal server errors."""
    
    def __init__(
        self,
        message: str = "Internal server error",
        code: str = "internal_server_error",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )


# --- Exception Handlers ---

def create_error_response(
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response following Rule 11.
    
    Args:
        code: Error code string
        message: Human-readable error message
        details: Additional error details
        
    Returns:
        Standardized error response dictionary
    """
    response = {
        "error": {
            "code": code,
            "message": message
        }
    }
    
    if details:
        response["error"]["details"] = details
        
    return response


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all exception handlers with the FastAPI application.
    
    Args:
        app: The FastAPI application instance
    """
    
    @app.exception_handler(BaseAPIException)
    async def handle_base_api_exception(
        request: Request, exc: BaseAPIException
    ) -> JSONResponse:
        """
        Handle custom API exceptions.
        
        Args:
            request: The request that caused the exception
            exc: The exception instance
            
        Returns:
            JSON response with standardized error format
        """
        logger.error(
            f"API Exception: {exc.code} - {exc.message}",
            extra={
                "request_path": request.url.path,
                "status_code": exc.status_code,
                "error_code": exc.code,
                "error_details": exc.details
            }
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            content=create_error_response(
                code=exc.code,
                message=exc.message,
                details=exc.details
            )
        )
    
    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """
        Handle FastAPI request validation errors.
        
        Args:
            request: The request that caused the exception
            exc: The exception instance
            
        Returns:
            JSON response with standardized error format
        """
        details = {"errors": []}
        for error in exc.errors():
            details["errors"].append({
                "loc": error.get("loc", []),
                "msg": error.get("msg", ""),
                "type": error.get("type", "")
            })
            
        logger.warning(
            "Request validation error",
            extra={
                "request_path": request.url.path,
                "validation_errors": details
            }
        )
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=create_error_response(
                code="validation_error",
                message="Request validation error",
                details=details
            )
        )
    
    @app.exception_handler(Exception)
    async def handle_generic_exception(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """
        Handle all unhandled exceptions.
        
        Args:
            request: The request that caused the exception
            exc: The exception instance
            
        Returns:
            JSON response with standardized error format
        """
        error_id = str(hash(f"{request.url.path}:{type(exc).__name__}:{str(exc)}"))
        
        logger.exception(
            f"Unhandled exception: {type(exc).__name__}",
            extra={
                "request_path": request.url.path,
                "error_id": error_id,
                "exception_type": type(exc).__name__
            }
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                code="internal_server_error",
                message="An unexpected error occurred",
                details={"error_id": error_id}
            )
        ) 