from io import StringIO
from contextlib import redirect_stdout

# import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import datetime
import sys
import traceback
import re
import logging
from datetime import datetime
import os
import matplotlib

matplotlib.use("Agg")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_python_code(input_string):
    logger.info("Entering extract_python_code function")

    # Define a regex pattern to match code blocks surrounded by triple backticks
    logger.info("Defining regex pattern to match code blocks")
    pattern = r"```(?:python)?(.*?)```"
    logger.info("Regex pattern defined")

    # Find all matches and join them into one string
    logger.info("Finding all matches for code blocks")
    code_blocks = re.findall(pattern, input_string, re.DOTALL)
    logger.info("Code blocks found")

    logger.info("Combining code blocks into one string")
    combined_code = "\n".join(block.strip() for block in code_blocks)
    logger.info("Code blocks combined")

    logger.info("Returning combined code")
    return combined_code


def execute_code(code, context, max_traceback_length=5000):
    logger.info("Entering execute_code function")
    context["pd"] = pd
    context["np"] = np
    context["plt"] = plt

    output_from_exec = None
    detailed_error_message = None

    logger.info("Creating StringIO object for capturing output")
    f_out = StringIO()

    try:
        logger.info("Redirecting stdout to StringIO object")
        with pd.option_context("display.max_rows", 100, "display.max_columns", 50):
            with redirect_stdout(f_out):
                logger.info("Executing code")
                exec(code, context)
            logger.info("Code executed successfully")
            output_from_exec = f_out.getvalue()
            logger.info(f"Output from execution: {output_from_exec}")
    except Exception as e:
        logger.error("Exception occurred during code execution")
        error_message = str(e)
        error_type = type(e).__name__  # Get the type of the exception
        tb = traceback.extract_tb(sys.exc_info()[2])

        logger.info("Splitting code into lines")
        code_lines = code.split("\n")
        logger.info("Code split into lines")

        logger.info("Numbering code lines")
        numbered_code_lines = [
            f"{i + 1:3d}: {line}" for i, line in enumerate(code_lines)
        ]
        logger.info("Code lines numbered")

        logger.info("Annotating error in code lines")
        for frame in tb:
            if frame.filename == "<string>":
                error_line_number = frame.lineno
                numbered_code_lines[
                    error_line_number - 1
                ] += f"  <-- Error: {error_type}: {error_message}"
        logger.info("Error annotated in code lines")

        logger.info("Getting full traceback")
        full_traceback = traceback.format_exc()
        logger.info("Full traceback obtained")

        # Truncate the traceback if it's too long
        if len(full_traceback) > max_traceback_length:
            logger.info("Truncating traceback")
            full_traceback = (
                full_traceback[:max_traceback_length]
                + "\n... [Traceback truncated] ..."
            )
            logger.info("Traceback truncated")

        logger.info("Constructing detailed error message")
        detailed_error_message = f"\nError Details:\n{error_type}: {error_message}\n\nTraceback (up to {max_traceback_length} characters):\n{full_traceback}"

        # Include the numbered code with the error annotation in the error message
        detailed_error_message = "\n".join(numbered_code_lines) + detailed_error_message
        logger.info("Detailed error message constructed")

    logger.info("Returning output and detailed error message")
    return output_from_exec, detailed_error_message


def generate_file_name(query: str) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_query = "".join(c if c.isalnum() else "_" for c in query)[:50]
    return f"{clean_query}_{timestamp}"


def get_formatted_today_date() -> str:
    return datetime.now().strftime("%d %b %Y")


def create_output_directories(base_dir: str, file_name: str):
    graphics_dir = os.path.join(base_dir, file_name, "graphics_output")
    tables_dir = os.path.join(base_dir, file_name, "tables_output")
    json_dir = os.path.join(base_dir, file_name, "json_output")
    os.makedirs(graphics_dir, exist_ok=True)
    os.makedirs(tables_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)
    return graphics_dir, tables_dir, json_dir

