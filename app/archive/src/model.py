import os
from openai import OpenAI, OpenAIError
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Retrieve the API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("API key not found. Please set OPENAI_API_KEY in your environment variables.")

# Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_output(messages, provider="openai", model="gpt-4"):
    if provider == "openai":
        try:
            # Generate a response from the OpenAI API
            result = client.chat.completions.create(
                model=model,
                messages=messages
            )
            return result.choices[0].message.content
        
        # Catch OpenAI-specific errors
        except OpenAIError as e:
            return f"An error occurred with the OpenAI API: {e}"
        
        # Catch any other unexpected errors
        except Exception as e:
            return f"An unexpected error occurred: {e}"

    else:
        return "Invalid provider specified. Currently, only 'openai' is supported."
