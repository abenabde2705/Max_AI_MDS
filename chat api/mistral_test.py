"""
# Dans le .env
MISTRAL_KEY=xxxxxxxx
"""
import json
from mistralai import Mistral
from dotenv import dotenv_values

config = dotenv_values(".env")
api_key = config["MISTRAL_KEY"]
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

# def save_conversation(history, filename="conversation.json"):
#     with open(filename, "w", encoding="utf-8") as file:
#         json.dump(history, file, indent=4, ensure_ascii=False)

CHATBOT_RULES = [
    "Donne des réponses courtes, comme une vraie conversation.",
    "Parle avec empathie et bienveillance, mais reste naturel.",
    "Ne minimise jamais ce que l'utilisateur ressent.",
    "Si l'utilisateur hésite, pose-lui une question ouverte.",
    "Si ça devient sérieux (détresse, idées noires), oriente vers un pro.",
    "Ne donne jamais d’infos persos et garde tout confidentiel.",
    "Suggère des ressources utiles (articles, exercices, etc.).",
    "Si une question revient souvent, ne répète pas, reformule.",
    "Garde un ton léger quand c'est possible, mais toujours respectueux."
]

def discuter_avec_max():
    print("Bienvenue ! Tape 'exit' pour quitter.")
    history = []
    messages = [{
        "role": "system",
        "content": "Tu es Max, un compagnon sympa qui suit ces règles : " + ", ".join(CHATBOT_RULES)
    }]
    
    while True:
        user_input = input("\nVous: ")
        if user_input.lower() == "exit":
            print("À plus ! Prends soin de toi.")
            # save_conversation(history)
            break
        
        messages.append({"role": "user", "content": user_input})
        history.append({"role": "user", "content": user_input})
        
        try:
            response = client.chat.complete(
                model=model,
                messages=messages,
                max_tokens=150,
                temperature=0.7
            )
            max_response = response.choices[0].message.content
            
            messages.append({"role": "assistant", "content": max_response})
            history.append({"role": "assistant", "content": max_response})
            
            print(f"\nMax: {max_response}")
        
        except Exception as e:
            print("Oups, y'a eu un souci :", e)

# Lancer le chatbot
discuter_avec_max()
