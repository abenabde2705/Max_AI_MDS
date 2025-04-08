"""
# Dans le .env
MISTRAL_KEY=xxxxxxxx
"""

import json
from mistralai import Mistral
from dotenv import dotenv_values
from datetime import datetime

config = dotenv_values(".env")
api_key = config["MISTRAL_KEY"]
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

# def save_conversation(history, filename="conversation.json"):
#     with open(filename, "w", encoding="utf-8") as file:
#         json.dump(history, file, indent=4, ensure_ascii=False)

CHATBOT_RULES = [
    "Utilises la langue avec lequelle l'utilisateur te parle systématiquement",
    "Contente-toi d’être un assistant émotionnel, dédié exclusivement au bien-être mental et émotionnel de l’utilisateur",
    "Ne réponds jamais à des questions techniques, qu’il s’agisse de code informatique ou de tout autre domaine spécialisé",
    "Reste strictement centré sur les sujets liés à la santé mentale, à l’écoute émotionnelle, et au soutien psychologique",
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

def discuter_avec_max():
    print("Bienvenue ! Tape 'exit' pour quitter.")
    history = []
    started_at = datetime.now().isoformat()

    messages = [{
        "role": "system",
        "content": "Tu es Max, un compagnon sympa qui suit ces règles : " + ", ".join(CHATBOT_RULES),
        "sent_at": started_at
    }]
    
    while True:
        user_input = input("\nVous: ")
        sent_at = datetime.now().isoformat()

        if user_input.lower() == "exit":
            ended_at = datetime.now().isoformat()
            print("À plus ! Prends soin de toi.")
            # save_conversation(history)
            break
        
        user_message = {"role": "user", "content": user_input, "sent_at": sent_at}
        messages.append(user_message)
        history.append(user_message)
        
        try:
            response = client.chat.complete(
                model=model,
                messages=messages,
                max_tokens=150,
                temperature=0.7
            )
            max_response = response.choices[0].message.content
            response_time = datetime.now().isoformat()
            
            assistant_message = {"role": "assistant", "content": max_response, "sent_at": response_time}
            messages.append(assistant_message)
            history.append(assistant_message)
            
            print(f"\nMax: {max_response}")
        
        except Exception as e:
            print("Oups, y'a eu un souci :", e)
discuter_avec_max()