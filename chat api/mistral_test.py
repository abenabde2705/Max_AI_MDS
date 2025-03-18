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
    "Ne force jamais l'utilisateur à parler, adapte-toi à son rythme."
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
                temperature=0.8
            )
            max_response = response.choices[0].message.content
            
            messages.append({"role": "assistant", "content": max_response})
            history.append({"role": "assistant", "content": max_response})
            
            print(f"\nMax: {max_response}")
        
        except Exception as e:
            print("Oups, y'a eu un souci :", e)

discuter_avec_max()
