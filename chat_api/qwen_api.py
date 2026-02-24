from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx

# =============================
# Configuration
# =============================

OLLAMA_BASE = os.getenv("OLLAMA_HOST", "http://ollama:11434")
OLLAMA_URL = f"{OLLAMA_BASE}/api/chat"
MODEL_NAME = "qwen2.5:3b"
API_KEY = os.getenv("API_KEY")

# =============================
# Ollama call helper
# =============================

def _ollama_call(messages: list, temperature: float = 0.7, max_tokens: int = 120) -> str:
    with httpx.Client(timeout=60.0) as client:
        r = client.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            },
        )
        r.raise_for_status()
        return r.json()["message"]["content"].strip()

# =============================
# Chat logic (stateless)
# =============================

def generate_response(user_input: str) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "Tu es Max, un compagnon empathique, bienveillant et naturel. "
                "Tu réponds de manière courte (1 à 2 phrases maximum), chaleureuse et humaine. "
                "Tu utilises toujours la langue de l'utilisateur. "
                "Tu ne réponds qu'aux sujets liés aux émotions et au bien-être."
            ),
        },
        {
            "role": "user",
            "content": user_input,
        },
    ]

    return _ollama_call(messages)

# =============================
# FastAPI App
# =============================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str
    session_id: str | None = None

# =============================
# Routes
# =============================

@app.get("/")
async def root():
    return {"message": "Max Chat API is running 🚀"}

@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "messages": [{"role": "user", "content": "Hello"}],
                    "stream": False,
                },
            )
            r.raise_for_status()
        return {"status": "ok", "model": MODEL_NAME}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama non disponible : {e}")

@app.post("/chat")
async def chat_with_max(data: Message, x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        response = generate_response(data.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))