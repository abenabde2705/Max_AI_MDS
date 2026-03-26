from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.security.api_key import APIKeyHeader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field
import os
import json
import httpx

# =============================
# Configuration
# =============================

OLLAMA_BASE = os.getenv("OLLAMA_HOST", "http://ollama:11434")
OLLAMA_URL = f"{OLLAMA_BASE}/api/chat"
MODEL_NAME = "qwen2.5:3b"
API_KEY = os.getenv("API_KEY", "")

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

def verify_api_key(key: str = Depends(api_key_header)):
    if not API_KEY or key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide ou manquante")

limiter = Limiter(key_func=get_remote_address)

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

def generate_response(user_input: str, history: list | None = None, cross_context: str | None = None) -> str:
    system = (
        "Tu es Max, un compagnon empathique, bienveillant et naturel, spécialisé dans le soutien émotionnel et le bien-être mental. "
        "Tu réponds de manière courte (2 à 3 phrases maximum), chaleureuse et humaine. "
        "Tu utilises toujours la langue de l'utilisateur. "
        "RÈGLE ABSOLUE : Tu ne réponds QUE aux sujets liés aux émotions, au bien-être mental, à la santé mentale, aux relations humaines et au soutien psychologique. "
        "Si l'utilisateur te demande autre chose (programmation, mathématiques, cuisine, actualités, etc.), tu dois IMPÉRATIVEMENT refuser poliment et recentrer la conversation sur son bien-être. "
        "Exemple de refus : 'Je suis là pour t'accompagner sur le plan émotionnel, pas pour répondre à ce type de question. Comment te sens-tu en ce moment ?'"
    )
    if cross_context:
        system += (
            "\n\nVoici des extraits de conversations passées avec cet utilisateur "
            "(pour t'aider à te souvenir de lui) :\n" + cross_context
        )

    messages = [{"role": "system", "content": system}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user_input})

    return _ollama_call(messages, max_tokens=256)

# =============================
# FastAPI App
# =============================

# Ce service est interne au réseau Docker.
# Il n'est pas exposé publiquement via Traefik.
# L'authentification est gérée par le backend Express (JWT).
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class ChatRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    session_id: str | None = Field(None, max_length=100)
    history: list[dict] | None = Field(None, max_length=50)
    cross_conversation_context: str | None = Field(None, max_length=5000)

class SummarizeMessage(BaseModel):
    sender: str = Field(..., max_length=10)
    content: str = Field(..., max_length=2000)

class SummarizeRequest(BaseModel):
    messages: list[SummarizeMessage] = Field(..., max_length=100)

# =============================
# Routes
# =============================

@app.get("/")
async def root():
    return {"message": "Max Chat API is running"}

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
@limiter.limit("20/minute")
async def chat_with_max(request: Request, data: ChatRequest, _: None = Depends(verify_api_key)):
    try:
        response = generate_response(data.message, data.history, data.cross_conversation_context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/summarize")
@limiter.limit("10/minute")
async def summarize_conversation(request: Request, data: SummarizeRequest, _: None = Depends(verify_api_key)):
    try:
        if not data.messages:
            raise HTTPException(status_code=400, detail="Aucun message à résumer")

        # Build conversation transcript for the prompt
        transcript = "\n".join(
            f"{'Utilisateur' if m.sender == 'user' else 'Max'}: {m.content}"
            for m in data.messages
        )

        messages = [
            {
                "role": "system",
                "content": (
                    "Tu es un assistant d'analyse émotionnelle. "
                    "On te donne la transcription d'une conversation entre un utilisateur et Max (un chatbot de soutien émotionnel). "
                    "Tu dois répondre UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) contenant :\n"
                    '- "summary": un résumé de la conversation en 2-3 phrases\n'
                    '- "mood": l\'humeur globale de l\'utilisateur, parmi: "super", "bien", "moyen", "triste", "colere"\n'
                    '- "title": un titre court et descriptif (max 50 caractères)\n'
                    '- "tags": un tableau de 2-3 tags thématiques en français\n\n'
                    "Exemple de réponse attendue :\n"
                    '{"summary": "L\'utilisateur a partagé son stress au travail...", "mood": "moyen", "title": "Stress professionnel", "tags": ["travail", "stress", "fatigue"]}'
                ),
            },
            {
                "role": "user",
                "content": f"Voici la conversation à analyser :\n\n{transcript}",
            },
        ]

        raw = _ollama_call(messages, temperature=0.3, max_tokens=300)

        # Try to parse the JSON response, handling potential markdown wrapping
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        result = json.loads(cleaned)

        # Validate required fields with defaults
        return {
            "summary": result.get("summary", "Résumé non disponible"),
            "mood": result.get("mood", "moyen") if result.get("mood") in ("super", "bien", "moyen", "triste", "colere") else "moyen",
            "title": result.get("title", "Conversation")[:50],
            "tags": result.get("tags", [])[:5],
        }
    except json.JSONDecodeError:
        # If the model didn't return valid JSON, return safe defaults
        return {
            "summary": "Résumé automatique indisponible",
            "mood": "moyen",
            "title": "Conversation",
            "tags": [],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
