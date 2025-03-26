# === FILE: app.py ===
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from services import answer
from typing import Dict

# Initialize FastAPI app
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/answer")
async def answer_endpoint(
    user_id: str,
    user_query: str,
):
    """
    Endpoint to handle user queries and generate answers.
    Calls the answer_query function from services.py
    """
    try:
        # Call the answer_query function directly
        response = answer(user_id, user_query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
