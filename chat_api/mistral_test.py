"""
# Dans le .env
MISTRAL_KEY=xxxxxxxx
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from datetime import datetime
from mistralai import Mistral
from dotenv import dotenv_values
import sys

class EmotionalChatbot:
    def __init__(self, model_name, api_key):
        # Initialisation du client Mistral
        self.client = Mistral(api_key=api_key)
        self.model = model_name
        self.history = []

        # Règles du compagnon émotionnel
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
        """
        Utilise Mistral pour classifier le message
        """
        prompt = f"""
            Tu es un classificateur de messages. 
            Ta tâche est de dire si le message d'un utilisateur fait partie d'une conversation émotionnelle ou sociale bienveillante.

            Répond uniquement par 'oui' ou 'non'.

            Considère comme 'non' si le message :
            - parle de technologie, d’informatique, de mathématiques, ou d’autres sujets techniques

            Sinon considère comme 'oui'.

            Message : "{user_input}"
            Réponse :
        """

        try:
            completion = self.client.chat.complete(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un classificateur 'oui' ou 'non'."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                max_tokens=5
            )

            response_text = completion.choices[0].message.content.strip().lower()
            return "oui" in response_text

        except Exception as e:
            print(f"Erreur lors de la classification : {e}")
            return False

    def generate_response(self, user_input: str) -> str:
        messages = self.history + [
            {"role": "user", 
             "content": f"Réponds de façon naturelle et amicale à : {user_input}. "
                        f"Assure-toi que ta réponse est complète et ne se termine pas au milieu d'une phrase.",
             "sent_at": datetime.now().isoformat()
            }
        ]

        try:
            completion = self.client.chat.complete(
                model=self.model,
                messages=[{"role": m["role"], "content": m["content"]} for m in messages],
                max_tokens=150,
                temperature=0.7
            )

            response_text = completion.choices[0].message.content.strip()

            assistant_message = {
                "role": "assistant",
                "content": response_text,
                "sent_at": datetime.now().isoformat()
            }

            self.history.append({"role": "user", "content": user_input})
            self.history.append(assistant_message)

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
                response = "Je suis désolé, je ne peux répondre qu’à des sujets liés aux émotions ou au bien-être mental."

            print(f"\nMax: {response}")


class ResponseFormatter:

    def __init__(self, client, model, max_tokens=80):
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
            completion = self.client.chat.complete(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
                temperature=0.7
            )
            return completion.choices[0].message.content.strip()


        except Exception as e:
            print(f"Erreur lors de la reformulation : {e}")
            return text


if __name__ == "__main__":
    config = dotenv_values(".env")
    api_key = config["MISTRAL_KEY"]
    model_name = "mistral-large-latest"

    max_chatbot = EmotionalChatbot(model_name=model_name, api_key=api_key)
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
api_key = os.getenv("MISTRAL_KEY")
if not api_key:
    # Fallback vers dotenv pour le développement
    try:
        config = dotenv_values(".env")
        api_key = config.get("MISTRAL_KEY")
    except:
        pass

if not api_key:
    raise ValueError("MISTRAL_KEY doit être défini dans les variables d'environnement")

chatbot_instance = EmotionalChatbot(model_name="mistral-large-latest", api_key=api_key)

@app.post("/chat")
async def chat_with_max(data: Message):
    try:
        user_input = data.message
        
        # Vérifier si c'est une question émotionnelle
        if chatbot_instance.is_emotional_question(user_input):
            response = chatbot_instance.generate_response(user_input)
            return {"response": response}
        else:
            return {"response": "Je suis là pour t'accompagner émotionnellement. Pour des questions techniques, je te conseille de consulter des ressources spécialisées."}
    
    except Exception as e:
        error_message = str(e)
        if "429" in error_message or "quota" in error_message.lower() or "capacity" in error_message.lower():
            raise HTTPException(
                status_code=429, 
                detail="API de chat temporairement indisponible (quota atteint). Veuillez réessayer plus tard."
            )
        raise HTTPException(status_code=500, detail=f"Erreur du service de chat: {error_message}")
