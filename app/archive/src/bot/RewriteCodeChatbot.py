# ==== FILE: temp/UnifiedDataScienceChatbot.py ====
from bot.BaseChatbot import BaseChatbot
from string import Template
from typing import Optional, Dict

class UnifiedDataScienceChatbot(BaseChatbot):
    def __init__(
        self,
        model_inference,
        descriptions: Optional[Dict[str, str]] = None,
        memory_size: int = 2,
    ):
        allowed_roles = ["system", "user", "assistant", "code", "code_result"]
        super().__init__(
            model_inference=model_inference,
            allowed_roles=allowed_roles,
            memory_size=memory_size,
        )

    def generate_answer(
        self,
        user_query: str,
        model: str:,
        **descriptions
    ) -> str:
        """
        Generate an answer based on the user query and descriptions.
        Accepts variable number of descriptions.
        """

        formatted_prompt = self.create_full_prompt(
            user_message=user_query,
            today_date=today_date,
            file_name=file_name,
            **descriptions  # Pass descriptions to format the prompt
        )
        raw_code = self.model_inference.generate(formatted_prompt)["results"][0]["generated_text"]
        return raw_code
    
    
    

    # def rewrite_code(
    #     self,
    #     user_query: str,
    #     today_date: str,
    #     file_name: str,
    #     code_result: str,
    #     raw_code: str,
    #     explanation: Optional[str] = None,
    #     **descriptions
    # ) -> str:
    #     """
    #     Rewrite code based on feedback.
    #     """

    #     # Append to temporary_messages
    #     if self.temporary_messages:
    #         self.temporary_messages[0] = {"role": "system", "content": Template(self.temporary_messages[0]["content"].safe_substitute(error_system_prompt="In case of error, give me only the corrected complete code block. Do not add additional explanation."))}
    #         self.temporary_messages.append({"role": "code", "content": raw_code})
    #         self.temporary_messages.append({"role": "code_result", "content": code_result})
    #         self.temporary_messages.append(
    #             {
    #                 "role": "user",
    #                 "content": (
    #                     f"Complain: {explanation}\n.Correct the code so that you can answer my question"
    #                     if explanation
    #                     else "There is an error in the code highlighted by '<-- Error'. Find that error and then change your code to fix that error. Do not give out anything else (no description), but the new complete and fixed code!"
    #                 ),
    #             }
    #         )

    #     formatted_history = self.get_formatted_history(
    #         today_date=today_date,
    #         file_name=file_name,
    #         messages=self.temporary_messages,
    #         **descriptions  # Pass descriptions to format the prompt
    #     )
    #     formatted_prompt = f"{formatted_history}<|start_header_id|>assistant<|end_header_id|>\n\n"
    #     new_code = self.model_inference.generate(formatted_prompt)["results"][0]["generated_text"]
    #     return new_code
