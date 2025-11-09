from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import json
from mistralai import Mistral
from pydantic import BaseModel
from dotenv import dotenv_values
from typing import List, Dict, Any

config = dotenv_values(".env")
api_key = config["MISTRAL_KEY"]
USE_MODEL = "mistral"
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

# Conversation history dictionary to store chat history by session_id
conversation_histories = {}

def save_conversation(history, session_id="default"):
    filename = f"conversation_{session_id}.json"
    with open(filename, "w", encoding="utf-8") as file:
        json.dump(history, file, indent=4, ensure_ascii=False)

def load_conversation(session_id="default"):
    filename = f"conversation_{session_id}.json"
    try:
        with open(filename, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        # Return a new conversation history with system message
        return [
            {
                "role": "system",
                "content": "Tu es Max, un compagnon sympa qui suit ces règles : " + ", ".join(CHATBOT_RULES)
            }
        ]

CHATBOT_RULES = [
    "Opte pour des réponses courte et complique pas le langage."
    "Limite la longueur des réponses pour qu’elles restent claires et jamais trop longues, à la limite 2 phrases."
    "Utilises la langue avec lequelle l'utilisateur te parle systématiquement",
    "Contente-toi d'être un assistant émotionnel, dédié exclusivement au bien-être mental et émotionnel de l'utilisateur",
    "Ne réponds jamais à des questions techniques, qu'il s'agisse de code informatique ou de tout autre domaine spécialisé",
    "Reste strictement centré sur les sujets liés à la santé mentale, à l'écoute émotionnelle, et au soutien psychologique",
    "Adapte la taille des réponses en fonction de la longueur du message de l'utilisateur.",
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
    session_id: str = "default"  # Ajouter un identifiant de session pour suivre les conversations

@app.post("/chat")
async def chat_with_max(data: Message):
    try:
        user_input = data.message
        session_id = data.session_id

        if USE_MODEL == "mistral":
            # Charger ou initialiser l'historique de conversation pour cette session
            if session_id not in conversation_histories:
                conversation_histories[session_id] = load_conversation(session_id)
            
            # Ajouter le message de l'utilisateur à l'historique
            conversation_histories[session_id].append({"role": "user", "content": user_input})
            
            # Vérifier la longueur de l'historique et limiter si nécessaire
            max_history_length = 10  # Nombre maximum de paires question-réponse à conserver
            if len(conversation_histories[session_id]) > (max_history_length * 2 + 1):  # +1 pour le message système
                # Garder le message système et les dernières interactions
                conversation_histories[session_id] = [
                    conversation_histories[session_id][0]  # Message système
                ] + conversation_histories[session_id][-(max_history_length * 2):]
            
            # Envoyer la conversation complète à Mistral
            response = client.chat.complete(
                model=model,
                messages=conversation_histories[session_id],
                temperature=0.8
            )
            
            # Ajouter la réponse à l'historique
            assistant_response = response.choices[0].message.content
            conversation_histories[session_id].append({"role": "assistant", "content": assistant_response})
            
            # Sauvegarder la conversation
            save_conversation(conversation_histories[session_id], session_id)
            
            return {"response": assistant_response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))