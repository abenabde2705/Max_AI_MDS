from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import ollama
from datetime import datetime
from dotenv import dotenv_values


class EmotionalChatbot:
    def __init__(self, model_name: str, ollama_host: str = "http://localhost:11434"):
        self.client = ollama.Client(host=ollama_host)
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

        self.system_message = {
            "role": "system",
            "content": "Tu es Max, un compagnon empathique, amical et bienveillant. Tu parles de manière simple et chaleureuse. Voici tes règles : " + ", ".join(self.chatbot_rules),
            "sent_at": datetime.now().isoformat()
        }
        self.history.append(self.system_message)

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
            response = self.client.chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un classificateur 'oui' ou 'non'."},
                    {"role": "user", "content": prompt}
                ],
                options={"temperature": 0.0, "num_predict": 5}
            )
            response_text = response['message']['content'].strip().lower()
            return "oui" in response_text

        except Exception as e:
            print(f"Erreur lors de la classification : {e}")
            return False

    def generate_response(self, user_input: str) -> str:
        messages = self.history + [
            {
                "role": "user",
                "content": f"Réponds de façon naturelle et amicale à : {user_input}. "
                           f"Assure-toi que ta réponse est complète et ne se termine pas au milieu d'une phrase.",
                "sent_at": datetime.now().isoformat()
            }
        ]

        try:
            response = self.client.chat(
                model=self.model,
                messages=[{"role": m["role"], "content": m["content"]} for m in messages],
                options={"temperature": 0.7, "num_predict": 150}
            )
            response_text = response['message']['content'].strip()

            self.history.append({"role": "user", "content": user_input})
            self.history.append({
                "role": "assistant",
                "content": response_text,
                "sent_at": datetime.now().isoformat()
            })

            return response_text

        except Exception as e:
            return f"Oups, y'a eu un souci : {e}"

    def chat(self):
        print("Bienvenue ! Tape 'exit' pour quitter.")
        formatter = ResponseFormatter(client=self.client, model=self.model, max_tokens=150)

        while True:
            user_input = input("\nVous: ")
            if user_input.lower() == "exit":
                print("À plus ! Prends soin de toi")
                break

            is_emotional = self.is_emotional_question(user_input)

            if is_emotional:
                raw_response = self.generate_response(user_input)
                response = formatter.make_friendly(raw_response)
            else:
                response = "Je suis désolé, je ne peux répondre qu'à des sujets liés aux émotions ou au bien-être mental."

            print(f"\nMax: {response}")


class ResponseFormatter:

    def __init__(self, client, model: str, max_tokens: int = 80):
        self.client = client
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
            response = self.client.chat(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                options={"temperature": 0.7, "num_predict": self.max_tokens}
            )
            return response['message']['content'].strip()

        except Exception as e:
            print(f"Erreur lors de la reformulation : {e}")
            return text


if __name__ == "__main__":
    config = dotenv_values(".env")
    ollama_host = config.get("OLLAMA_HOST", "http://localhost:11434")
    model_name = "qwen2:3b"

    max_chatbot = EmotionalChatbot(model_name=model_name, ollama_host=ollama_host)
    max_chatbot.chat()


# Configuration FastAPI pour l'API web
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


# Instance globale du chatbot
ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
chatbot_instance = EmotionalChatbot(model_name="qwen2:3b", ollama_host=ollama_host)


@app.get("/health")
async def health():
    try:
        chatbot_instance.client.list()
        return {"status": "ok", "model": chatbot_instance.model}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama non disponible : {e}")


@app.post("/chat")
async def chat_with_max(data: Message):
    try:
        user_input = data.message

        if chatbot_instance.is_emotional_question(user_input):
            response = chatbot_instance.generate_response(user_input)
            return {"response": response}
        else:
            return {"response": "Je suis là pour t'accompagner émotionnellement. Pour des questions techniques, je te conseille de consulter des ressources spécialisées."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur du service de chat: {str(e)}")
