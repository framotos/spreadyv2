# ==== FILE: temp/EvaluatorChatbot.py ====
from bot.BaseChatbot import BaseChatbot

class EvaluatorChatbot(BaseChatbot):
    def __init__(self, model_inference):
        super().__init__(
            model_inference=model_inference,
            allowed_roles=["system", "user", "assistant"],
            memory_size=2
        )

    def generate_answer(self, user_query, code, output_from_exec, today_date, file_name):
        user_message = (
            f"This is the user_query: {user_query}.\n\n"
            f"This is the analysis that the bot has conducted:\n{code}.\n\n"
            f"And this is the result of the analysis:\n{output_from_exec}"
        )

        formatted_prompt = self.create_full_prompt(
            user_message=user_message,
            today_date=today_date,
            file_name=file_name
        )
        answer = self.model_inference.generate(formatted_prompt)["results"][0]["generated_text"]
        return answer
