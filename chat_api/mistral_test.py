
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import json
from mistralai import Mistral
from pydantic import BaseModel
from dotenv import dotenv_values

config = dotenv_values(".env")
api_key = config["MISTRAL_KEY"]
USE_MODEL = "mistral"
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

# def save_conversation(history, filename="conversation.json"):
#     with open(filename, "w", encoding="utf-8") as file:
#         json.dump(history, file, indent=4, ensure_ascii=False)

CHATBOT_RULES = [
    "Adapte la taille des réponses en fonction de la longueur du message de l'utilisateur.",
    "Utilise un ton empathique et bienveillant, sans être trop formel.",
    "Ne minimise jamais les émotions exprimées.",
    "Si l'utilisateur hésite, pose des questions ouvertes ou fermées adaptées à son état d'esprit.",
    "Si un utilisateur montre des signes de détresse, encourage-le à chercher du soutien professionnel.",
    "Fournis des ressources utiles (articles, exercices, méditation, contacts pro).",
    "Évite les répétitions en reformulant si une question revient souvent.",
    "Maintiens un ton léger et naturel quand la situation le permet.",
    "Personnalise tes réponses en fonction des échanges précédents.",
    "Si une demande dépasse tes capacités, sois transparent et propose une alternative.",
    "Ne force jamais l'utilisateur à parler, adapte-toi à son rythme.",
    "reponds pas au question de chimie"
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
@app.post("/chat")
async def chat_with_max(data: Message):
    try:
        user_input = data.message

        if USE_MODEL == "mistral":
            messages = [
                {
                    "role": "system",
                    "content": "Tu es Max, un compagnon sympa qui suit ces règles : " + ", ".join(CHATBOT_RULES)
                },
                {"role": "user", "content": user_input}
            ]
            response = client.chat.complete(
                model=model,
                messages=messages,
                max_tokens=150,
                temperature=0.8
            )
            return {"response": response.choices[0].message.content}

        
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))