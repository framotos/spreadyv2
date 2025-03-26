# Agent Analytics for Financial Data

## Overview

**Agent Analytics** is a FastAPI application that leverages AI agents to analyze financial datasets, specifically balance sheet and income statement data.  It uses the Gemini API via `smolagents` to answer user questions about financial data and can generate visualizations based on these inquiries.

This application is designed to:

*   **Process financial data**: Analyze CSV datasets containing balance sheet and income statement information.
*   **Answer user questions**: Utilize an AI agent to understand and respond to user queries related to the financial data.
*   **Generate visualizations**: Create charts and graphs (saved as HTML files) based on data analysis to provide visual insights.
*   **Session-based interaction**: Maintain session-specific AI agents to enable conversational analysis over time.

## Getting Started

### Prerequisites

*   **Python 3.11+**
*   **pip** (Python package installer)
*   **Virtual environment** (recommended for managing dependencies)
*   **Gemini API Key**: You will need an API key from Google Cloud AI to use the Gemini models.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Anaudia/NeuroFinance
    cd NeuroFinance
    ```

2.  **Create a virtual environment in the project root:**
    ```bash
    python3.11 -m venv env_agent_analytics
    ```

3.  **Activate the virtual environment:**
    *   **On Linux/macOS:**
        ```bash
        source env_agent_analytics/bin/activate
        ```
    *   **On Windows:**
        ```bash
        .\\env_agent_analytics\\Scripts\\activate
        ```
        
4.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Navigate to the `app/backend` directory:**
    ```bash
    cd app/backend
    ```

6.  **Set up environment variables:**
    *   Create a \`.env\` file in the `app/backend` directory.
    *   Add your Gemini API key to the \`.env\` file:
        \`\`\`
        GEMNINI_APIKEY=YOUR_GEMINI_API_KEY
        \`\`\`
        Replace \`YOUR_GEMINI_API_KEY\` with your actual Gemini API key.

### Running the Application

1.  **Ensure your virtual environment is activated** (see "Installation" step 3).

2.  **Navigate to the `app/backend` directory:**
    ```bash
    cd app/backend
    ```

3.  **Start the FastAPI application using `uvicorn` via Python's module execution:**
    ```bash
    python -m uvicorn main:app --reload
    ```
    *   **`python -m uvicorn`**: This command explicitly runs `uvicorn` as a Python module using the Python interpreter from your activated virtual environment. This ensures that `uvicorn` and your application are running within the context of your virtual environment and using the installed dependencies.
    *   **`main:app`**:  Specifies that `uvicorn` should run the `app` instance found in the `main.py` file of the current directory (`app/backend`).
    *   **`--reload`**: Enables automatic reloading of the server whenever you make changes to the code, useful for development.

4.  **Access the application:** Once `uvicorn` starts, you will see output in your terminal indicating the application is running, usually at `http://127.0.0.1:8000`. You can then access the application's endpoints using this URL, and explore the interactive API documentation at  `http://127.0.0.1:8000/docs`.

## Usage

The application exposes a \`/ask\` endpoint via POST requests to interact with the AI agent. Make sure the application is running as described in the "Running the Application" section before attempting to use the \`/ask\` endpoint. You can use the interactive API documentation at `http://127.0.0.1:8000/docs` to test the endpoint.

### \`/ask\` Endpoint

*   **Method:** \`POST\`
*   **Endpoint URL:**  \`http://127.0.0.1:8000/ask\` (or the address where your application is running)
*   **Request Body (JSON) Example:**

    ```json
    {
      "session_id": "Paul",
      "question": "How did interest expense impact the company’s pretax income in both years?",
      "dataset_type": "income",
      "years": [
        2020,
        2021,
        2022
      ]
    }
    ```

    **Request Body (JSON) Schema:**

    ```json
    {
      "session_id": "user_session_123",
      "question": "What is the trend of net income over the years for all companies?",
      "dataset_type": "income",
      "years": [2020, 2021, 2022, 2023]
    }
    ```

    **Request Parameters:**
    *   \`session_id\` (string, required): A unique identifier for the user's session. This allows the application to maintain conversation history for each user.
    *   \`question\` (string, required): The user's question about the financial data.
    *   \`dataset_type\` (string, optional): Specifies the dataset type to use. Possible values: \`"income"\` (for income statement data), \`"balance"\` (for balance sheet data). If omitted, both datasets may be used.
    *   \`years\` (list of integers, optional): A list of years to filter the data by. If omitted, all available years will be considered.

*   **Response (JSON):**

    ```json
    {
      "answer": "Here's the analysis of net income trends...",
      "output_folder": "user_question_output_abcd",
      "html_files": ["net_income_trend.html"]
    }
    ```

    **Response Fields:**
    *   \`answer\` (string): The AI agent's textual response to the user's question.
    *   \`output_folder\` (string): The name of the output folder (within \`user_output/\`) where generated files are saved.
    *   \`html_files\` (list of strings): A list of HTML filenames generated (e.g., charts, visualizations). These files can be accessed via the \`/user_output/{output_folder}/{filename}\` path. For example: \`http://127.0.0.1:8000/user_output/user_question_output_abcd/net_income_trend.html\`.
