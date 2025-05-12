"""
Logging configuration for the API.

This module provides utilities for structured JSON logging.
"""

import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional, Union

from .config import settings

class JSONFormatter(logging.Formatter):
    """
    Formatter for JSON-structured logs.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format a log record as JSON.
        
        Args:
            record: The log record to format
            
        Returns:
            JSON-formatted log string
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "path": f"{record.pathname}:{record.lineno}",
            "function": record.funcName,
            "process_id": record.process,
            "thread_id": record.thread
        }
        
        # Add extra fields from the record
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            log_data.update(record.extra)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": self.formatException(record.exc_info)
            }
        
        # Add any extra attributes added via LoggerAdapter or extra parameter
        for key, value in record.__dict__.items():
            if key not in {
                "args", "asctime", "created", "exc_info", "exc_text", "filename",
                "funcName", "id", "levelname", "levelno", "lineno", "module",
                "msecs", "message", "msg", "name", "pathname", "process",
                "processName", "relativeCreated", "stack_info", "thread", "threadName",
                "extra"
            }:
                try:
                    # Try to serialize the value to ensure it's JSON-compatible
                    json.dumps({key: value})
                    log_data[key] = value
                except (TypeError, OverflowError):
                    # If not serializable, convert to string
                    log_data[key] = str(value)
        
        return json.dumps(log_data)


def configure_logging() -> None:
    """
    Configure structured JSON logging for the application.
    """
    # Create handlers
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    
    # Create file handler if enabled
    if settings.LOG_TO_FILE:
        file_handler = logging.FileHandler(settings.LOG_FILE_PATH)
        file_handler.setFormatter(JSONFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL.upper())
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add our handlers
    root_logger.addHandler(console_handler)
    if settings.LOG_TO_FILE:
        root_logger.addHandler(file_handler)
    
    # Configure specific loggers
    for logger_name, level in settings.LOGGER_LEVELS.items():
        logger = logging.getLogger(logger_name)
        logger.setLevel(level.upper())


class StructuredLogger:
    """
    Helper class for structured logging with context.
    """
    
    def __init__(self, name: str):
        """
        Initialize the structured logger.
        
        Args:
            name: Logger name
        """
        self.logger = logging.getLogger(name)
    
    def _log(
        self,
        level: int,
        msg: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Union[bool, Exception, None] = None
    ) -> None:
        """
        Log a message with structured context.
        
        Args:
            level: Log level
            msg: Log message
            extra: Extra context data
            exc_info: Exception information
        """
        self.logger.log(level, msg, extra={"extra": extra or {}}, exc_info=exc_info)
    
    def debug(self, msg: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log a debug message."""
        self._log(logging.DEBUG, msg, extra)
    
    def info(self, msg: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log an info message."""
        self._log(logging.INFO, msg, extra)
    
    def warning(self, msg: str, extra: Optional[Dict[str, Any]] = None) -> None:
        """Log a warning message."""
        self._log(logging.WARNING, msg, extra)
    
    def error(
        self,
        msg: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Union[bool, Exception, None] = None
    ) -> None:
        """Log an error message."""
        self._log(logging.ERROR, msg, extra, exc_info)
    
    def critical(
        self,
        msg: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: Union[bool, Exception, None] = None
    ) -> None:
        """Log a critical message."""
        self._log(logging.CRITICAL, msg, extra, exc_info)
    
    def exception(
        self,
        msg: str,
        extra: Optional[Dict[str, Any]] = None,
        exc_info: bool = True
    ) -> None:
        """Log an exception message."""
        self._log(logging.ERROR, msg, extra, exc_info)


def get_logger(name: str) -> StructuredLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Logger name
        
    Returns:
        Structured logger instance
    """
    return StructuredLogger(name) 