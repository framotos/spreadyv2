# ==== FILE: temp/BaseChatbot.py ====
from string import Template
from typing import Dict, Optional, List
from model import generate_output


class BaseChatbot:
    def __init__(
        self,
        system_message: str,
        allowed_roles: Optional[List[str]] = None,
        memory_size: int = 2,       
    ):
        self.system_message = system_message
        self.messages = []
        self.memory_size = memory_size
        self.allowed_roles = ["user", "assistant"]
        self.temporary_messages = []

    def add_message(self, message: Dict[str, str]):
        """
        Add a message to the conversation history.
        """
        if (
            not isinstance(message, dict)
            or "role" not in message
            or "content" not in message
        ):
            raise ValueError("Message must be a dictionary with 'role' and 'content' keys")

        if message["role"] not in self.allowed_roles:
            raise ValueError(f"Invalid role. Allowed roles are: {', '.join(self.allowed_roles)}")

        self.messages.append(message)

    def truncate_history(self):
        """
        Truncate the conversation history to maintain the memory size.
        Keeps only the most recent interactions based on memory_size.
        """
        if len(self.messages) > self.memory_size:
            self.messages = self.messages[-self.memory_size:]

    def create_full_prompt(self, user_message: Optional[str] = None) -> str:
        """
        Create the full prompt by combining formatted history with the new user message.
        """
        self.truncate_history()
        prompt = [{"role": "system", "content": self.system_message}] + self.messages
    
        if user_message:
            prompt.append({"role": "user", "content": user_message})
            
        return prompt

    def generate_answer(self, user_message: Optional[str] = None) -> str:
        """
        Generate an answer using the model inference based on the provided arguments.
        """
        formatted_prompt = self.create_full_prompt(user_message)
        
        return generate_output(formatted_prompt)
    
    def get_messages_incl_system_prompt(self) -> List[Dict[str, str]]:
        """
        Get all messages including the system prompt.
        """
        # Optionally, include the system message as a separate entry if needed
        return [{"role": "system", "content": self.system_message}] + self.messages
