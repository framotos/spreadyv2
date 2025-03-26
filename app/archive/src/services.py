# ==== FILE: services.py ====

# Standard Libraries
import json
import logging
import threading
import time
import re
from typing import Dict, Tuple, Optional, List, Any, Union
from contextlib import contextmanager, asynccontextmanager
import os

# Third-Party Libraries
import pandas as pd
from fastapi import HTTPException, Request, FastAPI

# Local Modules
from responseModels import (
    CodeGenerationOutput,
    CodeGenerationResult,
    AnswerResponse,
    QueryResponse,
)
from utils import (
    execute_code,
    extract_python_code,
    generate_file_name,
    get_formatted_today_date,
    create_output_directories,
)
from bot.UnifiedDataScienceChatbot import UnifiedDataScienceChatbot

from bot.BaseChatbot import BaseChatbot



from prompt.systemPrompt import SYSTEM_PROMPT
from prompt.answerPrompt import ANSWER_SYSTEM_PROMPT
from prompt.system_prompt_evaluator import SYSTEM_PROMPT_EVALUATOR
from prompt.rewritePrompt import SYSTEM_PROMPT_REWRITE

from data_description.sp_500_description import sp_500_description


# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


# Global variables to hold BigQuery data
bigquery_result = None
users_df = None
users_description = None
earliest_date = None
latest_date = None

BASE_USER_DIR = "backend/src/user_outputs"
sp_500_df = pd.read_pickle("/Users/paulroeseler/Documents/GitHub/agent_analytics/backend/src/data_files/sp_500.pkl")

# Initialize a single instance of UnifiedDataScienceChatbot
from contextlib import contextmanager


@contextmanager
def log_time_block(block_name: str):
    start_time = time.perf_counter()
    logging.info(f"Started block: {block_name}")
    try:
        yield
    finally:
        end_time = time.perf_counter()
        duration = end_time - start_time
        logging.info(f"Finished block: {block_name} in {duration:.4f} seconds")


user_datascience_chatbots: Dict[str, UnifiedDataScienceChatbot] = {}
chatbot_lock = threading.Lock()
today_date = get_formatted_today_date()


from urllib.parse import urlparse


def remove_scheme(url):
    parsed = urlparse(url)
    return f"{parsed.netloc}{parsed.path}"


def get_user_chatbot(
    user_id: str,
) -> Tuple[BaseChatbot, BaseChatbot, BaseChatbot]:
    """
    Retrieve the chatbot instance for the given user_id.
    If it doesn't exist, create a new one.
    """
    with chatbot_lock:
        if user_id not in user_datascience_chatbots:
            unified_chatbot = BaseChatbot(system_message = SYSTEM_PROMPT.safe_substitute(description=sp_500_description, today_date=today_date))

            # Initialize evaluator chatbot
            evaluator_bot = BaseChatbot(system_message = SYSTEM_PROMPT_EVALUATOR.safe_substitute(today_date=today_date))

            # Initialize simplified chatbot for general answers
            answer_bot = BaseChatbot(system_message = ANSWER_SYSTEM_PROMPT.safe_substitute(today_date=today_date))
            
            rewrite_bot = BaseChatbot(system_message = SYSTEM_PROMPT_REWRITE.safe_substitute(today_date=today_date))
     
            user_datascience_chatbots[user_id] = (
                unified_chatbot,
                evaluator_bot,
                answer_bot,
                rewrite_bot
            )
            
        return user_datascience_chatbots[user_id]


def answer(
    user_id: str,
    user_query: str,
) -> None:
    
    file_name_generated = generate_file_name(user_query)
    today_date = get_formatted_today_date()
    graphics_dir, tables_dir, json_dir = create_output_directories(
        BASE_USER_DIR, file_name_generated
    )
    analyzer_bot, evaluator_bot, answer_bot, rewrite_bot = get_user_chatbot(user_id)
    # Process the dataset and get code generation output and the chatbot instance used
    
    context = {"sp_500_df": sp_500_df}
    descriptions = {"description": sp_500_description}
    
    code_gen_output = generate_code(
        evaluator_bot=evaluator_bot,
        bot_instance=analyzer_bot,
        rewrite_bot=rewrite_bot,
        query=user_query,
        today_date=today_date,
        file_name=file_name_generated,
        description=descriptions,
        context=context,
        max_attempts=3,
    )
    
    logging.info(f"Processing query for user: {user_id}")


    # Generate the final answer
    with log_time_block(f"Time: Generate Answer"):
        answer = generate_final_answer(
            answer_bot, user_query, code_gen_output, today_date, file_name_generated
        )
        
    add_messages(
        analyzer_bot, evaluator_bot, answer_bot, rewrite_bot, code_gen_output, user_query, answer
    )
    
    # Read all HTML and table contents from respective folders
    html_files_content = read_all_files_in_folder(graphics_dir)
    table_files_content = read_all_files_in_folder(tables_dir)
    json_files_content = read_all_files_in_folder(json_dir)

    # Return the contents directly in the response
    return {
        "status": "success",
        "message": answer,
        "html_files": html_files_content,
        "table_files": table_files_content,
    }

def add_messages(
    analyzer_bot: BaseChatbot,
    evaluator_bot: BaseChatbot,
    answer_bot: BaseChatbot,
    rewrite_bot: BaseChatbot,
    code_gen_output: CodeGenerationOutput,
    user_query,
    answer
):
    
    # Add generated code and its result to the chatbot's message history    
    if code_gen_output.raw_code:     
        analyzer_bot.add_message({"role": "user", "content": user_query})
        analyzer_bot.add_message({"role": "assistant", "content": f"{code_gen_output.raw_code}\n\nOutput of Executed Code:\n{code_gen_output.output}"})

    # Add messages to the evaluator bot
    if code_gen_output.raw_code: 
        evaluator_bot.add_message({"role": "user", "content": f"""This is the user_query: {user_query}.\n\nThis is the analysis that the bot has conducted:\n{code_gen_output.raw_code}.\n\nAnd this is the result of the analysis:\n{code_gen_output.output}"""})
        evaluator_bot.add_message({"role": "assistant", "content": code_gen_output.feedback})


    answer_bot.add_message({"role": "user", "content": user_query})
    answer_bot.add_message({"role": "assistant", "content": answer})
    rewrite_bot.messages = analyzer_bot.messages
    
    
def regenerate_code(rewrite_bot, error_message = None, evaluation = None):
    with log_time_block("Time: Rewrite Code"):
        if error_message:
            user_query = f"Please correct the code: {error_message}\n\nThere is an error in the code highlighted by '<-- Error'. Find that error and then change your code to fix that error. Do not give out anything else (no description), but the new complete and fixed code!"
        else:
            user_query = f"A colleague of mine evaluated your code and did not like it. Please change it in regards to his feedback: {evaluation}\n\nDo not give out anything else (no description), but the new complete and fixed code!"
        raw_code = rewrite_bot.generate_answer(
            user_message=user_query)
        return raw_code, user_query
                

def generate_code(
    bot_instance: BaseChatbot,
    evaluator_bot: BaseChatbot,
    rewrite_bot: BaseChatbot,
    query: str,
    today_date: str,
    file_name: str,
    description: Dict[str, str],
    context: Dict,
    max_attempts: int = 3,
    additional_params: Optional[Dict] = None,
) -> CodeGenerationOutput:
    """
    Generic function to generate code using a unified chatbot instance.

    :param bot_instance: The chatbot instance to use for code generation.
    :param query: User query.
    :param today_date: Current date.
    :param file_name: Generated file name.
    :param description: Description(s) of the dataset.
    :param context: Execution context for the code.
    :param max_attempts: Maximum number of attempts for code generation.
    :param additional_params: Any additional parameters required.
    :return: CodeGenerationOutput object.
    """
    evaluation = None
    error_message = None
    for attempt in range(max_attempts):
        if attempt == 0:
            # Initial code generation
            with log_time_block(f"Time: Generate Code"):
                raw_code = bot_instance.generate_answer(
                    user_message=query 
                )

        code = extract_python_code(raw_code)
        json_dir = os.path.join(BASE_USER_DIR, file_name, 'json_output')
        code = add_json_save_lines_for_multiple_graphs(code, json_dir)
        code = code.replace(
            "graphics_output", f"{BASE_USER_DIR}/{file_name}/graphics_output"
        )
        code = code.replace(
            "tables_output", f"{BASE_USER_DIR}/{file_name}/tables_output"
        )
        logging.info(f"Extracted code: {code}")
        # Execute the generated code
        with log_time_block(f"Time: Execute Code"):
            output_from_exec, error_message = execute_code(code, context)
        logging.info(f"Output of execution code: {output_from_exec}")
        
        json_dir = os.path.join(BASE_USER_DIR, file_name, 'json_output')
        figure_details_str = extract_figure_details(json_dir)
        logging.info(f"Extracted Figure Details:\n{figure_details_str}")
        
        parts = []
        if output_from_exec:
            parts.append(output_from_exec)
        if figure_details_str:
            parts.append(f"Figure Details:\n{figure_details_str}")
        # Combine the parts with two newlines if any parts exist
        output_from_exec = "\n\n".join(parts) if parts else ""
        
        if error_message:
            logging.info(f"Error message: {error_message}")
            delete_output_files(file_name)
            if attempt == max_attempts - 1:
                return CodeGenerationOutput(
                    result=CodeGenerationResult.FAILED_ERROR,
                    raw_code=raw_code,
                    output=output_from_exec,
                    feedback=evaluation,
                    error=error_message
                )
            
            rewrite_bot.add_message({"role": "user", "content": query})
            rewrite_bot.add_message({"role": "assistant", "content": f"{raw_code}\n\nOutput of Executed Code:\n{output_from_exec}"})
            raw_code, query = regenerate_code(rewrite_bot, error_message = error_message)
            continue

        # Evaluate the generated code's output
        with log_time_block(f"Time: Evaluation"):
            prompt = f"This is the user question: {query}\n\nThis is the code: {raw_code}\n\nOutput of Executed Code:\n{output_from_exec}"
            evaluation = evaluator_bot.generate_answer(user_message=prompt)
            
        necessary_code_regenerate = "true" in evaluation.lower()
        logging.info(f"Evaluation: {evaluation}")
        logging.info(f"Code needs to be regenerated: {necessary_code_regenerate}")

        if necessary_code_regenerate:
            if attempt != max_attempts - 1:
                delete_output_files(file_name)
                rewrite_bot.add_message({"role": "user", "content": query})
                rewrite_bot.add_message({"role": "assistant", "content": f"{raw_code}\n\nOutput of Executed Code:\n{output_from_exec}"})
                raw_code, query = regenerate_code(rewrite_bot, error_message = error_message) 
            else:
                return CodeGenerationOutput(
                    result=CodeGenerationResult.FAILED_EVALUATION,
                    raw_code=raw_code,
                    output=output_from_exec,
                    feedback=evaluation,
                    error=error_message
                )
        else:
            return CodeGenerationOutput(
                result=CodeGenerationResult.SUCCESS,
                raw_code=raw_code,
                output=output_from_exec,
                feedback=evaluation,
                error=error_message
            )

    return CodeGenerationOutput(
        result=CodeGenerationResult.FAILED_EVALUATION,
        raw_code=raw_code,
        output=output_from_exec,
        feedback=evaluation,
        error=error_message
    )


def generate_final_answer(
    answer_bot: BaseChatbot,
    query: str,
    code_gen_output: CodeGenerationOutput,
    today_date: str,
    file_name: str,
) -> AnswerResponse:
    if code_gen_output.result == CodeGenerationResult.SUCCESS:
        prompt = f"This is the user question: {query}.\n\nThis is the code that was developed:{code_gen_output.raw_code}\n\nThis is the result of the code:{code_gen_output.output}"
        
        answer = answer_bot.generate_answer(prompt)
        return AnswerResponse(
            answer=answer, code=code_gen_output.raw_code, output=code_gen_output.output
        )
    elif code_gen_output.result == CodeGenerationResult.FAILED_ERROR:
        # Use the feedback message from CodeGenerationOutput
        error_message = code_gen_output.feedback or "Entschuldigung, es ist mir mehrmals in Folge nicht gelungen, die erforderliche Analyse durchzuführen, um Ihre Frage beantworten zu können. Könnten Sie bitte Ihre Frage umformulieren oder weitere Details angeben?"
        return AnswerResponse(
            answer=error_message, code=None, output=code_gen_output.output
        )
    else:  # FAILED_EVALUATION
        evaluation_message = f"Ich habe Schwierigkeiten, eine zufriedenstellende Antwort auf Ihre Anfrage zu generieren. Der letzte Versuch hat meine Qualitätsstandards nicht erfüllt. Könnten Sie bitte mehr Kontext geben oder Ihre Frage umformulieren?"
        return AnswerResponse(
            answer=evaluation_message, code=None, output=code_gen_output.output
        )

    
def delete_output_files(file_name: str) -> None:
    """
    Deletes all files in the json_output, tables_output, and graphics_output directories
    for the specified file_name.

    Args:
        file_name (str): The base name of the user's file to identify directories.
    """
    output_dirs = ['json_output', 'tables_output', 'graphics_output']
    for output_dir in output_dirs:
        dir_path = os.path.join(BASE_USER_DIR, file_name, output_dir)
        if os.path.exists(dir_path):
            try:
                for filename in os.listdir(dir_path):
                    file_path = os.path.join(dir_path, filename)
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                        logging.info(f"Deleted file: {file_path}")
                    elif os.path.isdir(file_path):
                        # If there are subdirectories, recursively delete them
                        import shutil
                        shutil.rmtree(file_path)
                        logging.info(f"Deleted directory and its contents: {file_path}")
            except Exception as e:
                logging.error(f"Failed to delete {dir_path}. Reason: {e}")
        else:
            logging.warning(f"Directory does not exist and cannot be deleted: {dir_path}")
            

def read_all_files_in_folder(folder_path: str, file_extension: str) -> Dict[str, str]:
    """
    Reads all files with the specified extension in a folder and returns their content.
    Args:
        folder_path (str): Path to the folder containing files.
        file_extension (str): The file extension to filter by (e.g., '.html', '.csv').
    Returns:
        Dict[str, str]: A dictionary where keys are filenames and values are file contents.
    """
    file_contents = {}
    for filename in os.listdir(folder_path):
        if filename.endswith(file_extension):
            full_path = os.path.join(folder_path, filename)
            with open(full_path, 'r', encoding='utf-8') as file:
                file_contents[filename] = file.read()
    return file_contents


def add_json_save_lines_for_multiple_graphs(code: str, json_dir: str) -> str:
    """
    Modifies the provided code by adding lines to save Plotly figures as JSON files.
    
    Args:
        code (str): The original Python code.
        json_dir (str): The directory where JSON files should be saved.
    
    Returns:
        str: The modified Python code with JSON saving lines added.
    """
    # Define the regex pattern to find all figure objects and HTML filenames before .write_html
    pattern = r'(\w+)\s*\.write_html\(\s*[\'"]([^\'"]+\.html)[\'"]\s*\)'
    
    # Find all matches in the provided code
    matches = re.finditer(pattern, code)
    
    # Initialize a list to hold the positions where new code will be inserted
    insertions = []
    
    for match in matches:
        figure_name = match.group(1)  
        html_file_path = match.group(2)  
        
        # Get the base filename without the directory and extension
        base_filename = os.path.splitext(os.path.basename(html_file_path))[0]
        # Create the new lines that save the figure as a JSON file in json_output folder
        json_save_line = f"\n{figure_name}.write_json('{json_dir}/{base_filename}.json', pretty=True)\n"
        
        # Find the end of the line where .write_html is located to insert the new code after it
        end_of_line_index = code.find('\n', match.end())
        if end_of_line_index == -1:
            end_of_line_index = len(code)
        insertions.append((end_of_line_index + 1, json_save_line))
    
    # Insert new JSON save lines into the original code, starting from the last one to avoid shifting indexes
    for insertion_point, json_code in reversed(insertions):
        code = code[:insertion_point] + json_code + code[insertion_point:]
    
    return code


def extract_figure_details(json_folder: str) -> str:
    """
    Reads all JSON files in the specified folder and compiles them into a formatted string.
    Each figure is numbered sequentially, its name is included, and specific keys are included
    from the figure JSON ("data" and filtered "layout" keys excluding "layout.template").
    
    Args:
        json_folder (str): Path to the folder containing JSON files.
    
    Returns:
        str: A formatted string containing the filtered JSON content of all figures.
    """
    figure_details = []
    
    json_files = [f for f in os.listdir(json_folder) if f.endswith('.json')]
    
    for idx, json_file in enumerate(json_files, 1):
        json_path = os.path.join(json_folder, json_file)
        
        try:
            with open(json_path, 'r') as file:
                fig_dict = json.load(file)
        except Exception as e:
            logging.error(f"Error reading {json_file}: {e}")
            continue
        
        figure_name = os.path.splitext(json_file)[0]  # Get the name of the figure without '.json'
        figure_info = f"Figure {idx}: {figure_name}\n"
        
        # Always include the 'data' key
        filtered_figure = {"data": fig_dict.get("data", [])}
        
        # Filter 'layout' keys, excluding 'template'
        layout = fig_dict.get("layout", {})
        filtered_layout = {k: v for k, v in layout.items() if k != "template"}
        if filtered_layout:
            filtered_figure["layout"] = filtered_layout
        
        # Format filtered JSON nicely
        figure_info += json.dumps(filtered_figure, indent=1, ensure_ascii=False)
        figure_info += "\n\n"
        
        figure_details.append(figure_info)
    
        final_string = "\n".join(figure_details)

        max_chars = 100000
        if len(final_string) > max_chars:
            final_string = final_string[:max_chars]
            final_string += "\n\n[Output truncated to 100,000 characters]"
            
        return final_string