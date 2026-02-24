from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
from datetime import datetime
from dotenv import dotenv_values

OLLAMA_URL = os.getenv("OLLAMA_HOST", "http://ollama:11434/api/generate")
MODEL_NAME = "qwen2.5:3b"
API_KEY = os.getenv("API_KEY")

def _ollama_call(prompt: str, options: dict) -> str:
    with httpx.Client(timeout=60.0) as client:
        r = client.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": options,
        })
        r.raise_for_status()
        return r.json()["response"].strip()

class EmotionalChatbot:
    def __init__(self, model_name: str):
        self.model = model_name
        self.history = []

        self.chatbot_rules = [
            "Utilises la langue avec lequelle l'utilisateur te parle systématiquement",
            "Fais des réponses courtes, pas plus d'une phrase, naturelle et amicale.",
            "Ne minimise jamais les émotions exprimées.",
            "Si l'utilisateur hésite, pose des questions ouvertes ou fermées adaptées à son état d'esprit.",
            "Si un utilisateur montre des signes de détresse, encourage-le à chercher du soutien professionnel.",
            "Fournis des ressources utiles (articles, exercices, méditation, contacts pro).",
            "Évite les répétitions en reformulant si une question revient souvent.",
            "Maintiens un ton léger et naturel quand la situation le permet.",
            "Personnalise tes réponses en fonction des échanges précédents.",
            "Si une demande dépasse tes capacités, sois transparent et propose une alternative.",
            "Ne force jamais l'utilisateur à parler, adapte-toi à son rythme."
        ]

        self.history.append({
            "role": "system",
            "content": "Tu es Max, un compagnon empathique, amical et bienveillant. Tu parles de manière simple et chaleureuse. Voici tes règles : " + ", ".join(self.chatbot_rules),
        })

    def is_emotional_question(self, user_input: str) -> bool:
        prompt = f"""
            Tu es un classificateur de messages.
            Ta tâche est de dire si le message d'un utilisateur fait partie d'une conversation émotionnelle ou sociale bienveillante.

            Répond uniquement par 'oui' ou 'non'.

            Considère comme 'non' si le message :
            - parle de technologie, d'informatique, de mathématiques, ou d'autres sujets techniques

            Sinon considère comme 'oui'.

            Message : "{user_input}"
            Réponse :
        """

        try:
            text = _ollama_call(
                prompt=prompt,
                options={"temperature": 0.0, "num_predict": 5},
            )
            return "oui" in text.lower()
        except Exception as e:
            print(f"Erreur lors de la classification : {e}")
            return True
    def generate_response(self, user_input: str) -> str:
        try:
            prompt = (
                f"{self.history[0]['content']}\n\n"
                f"Utilisateur: {user_input}\n"
                f"Assistant:"
            )

            response_text = _ollama_call(
                prompt=prompt,
                options={"temperature": 0.7, "num_predict": 80}
            )

            self.history.append({"role": "user", "content": user_input})
            self.history.append({"role": "assistant", "content": response_text})

            return response_text

        except Exception as e:
            return f"Oups, y'a eu un souci : {e}"
class ResponseFormatter:

    def __init__(self, model: str, max_tokens: int = 80):
        self.model = model
        self.max_tokens = max_tokens

    def make_friendly(self, text: str) -> str:
        prompt = f"""
            Tu es un assistant amical, chaleureux et naturel.
            Voici une réponse brute du chatbot : "{text}"

            Réécris cette réponse pour qu'elle soit :
            - sans coupure de phrase.
            - fluide et humaine,
            - concise,
            - sans répétitions

            Réponse :
        """
        try:
          return _ollama_call(
            prompt=prompt,
            options={"temperature": 0.7, "num_predict": self.max_tokens},
        )
        except Exception as e:
            print(f"Erreur lors de la reformulation : {e}")
            return text


if __name__ == "__main__":
    config = dotenv_values(".env")
    if config.get("OLLAMA_HOST"):
        os.environ["OLLAMA_HOST"] = config["OLLAMA_HOST"]

    max_chatbot = EmotionalChatbot(model_name="qwen2.5:3b")
    formatter = ResponseFormatter(model="qwen2.5:3b")

    print("Bienvenue ! Tape 'exit' pour quitter.")
    while True:
        user_input = input("\nVous: ")
        if user_input.lower() == "exit":
            print("À plus ! Prends soin de toi")
            break

        if max_chatbot.is_emotional_question(user_input):
            raw = max_chatbot.generate_response(user_input)
            print(f"\nMax: {formatter.make_friendly(raw)}")
        else:
            print("\nMax: Je suis désolé, je ne peux répondre qu'à des sujets liés aux émotions ou au bien-être mental.")


# Configuration FastAPI
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
    session_id: str = "default"


chatbot_instance = EmotionalChatbot(model_name="qwen2.5:3b")


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "prompt": "Hi",
                "stream": False,
            })
            r.raise_for_status()
        return {"status": "ok", "model": MODEL_NAME}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama non disponible : {e}")

@app.post("/chat")
async def chat_with_max(data: Message, x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        user_input = data.message
        if chatbot_instance.is_emotional_question(user_input):
            response = chatbot_instance.generate_response(user_input)
            return {"response": response}
        return {"response": "Je suis là pour t'accompagner émotionnellement. Pour des questions techniques, je te conseille de consulter des ressources spécialisées."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du service de chat: {str(e)}")
