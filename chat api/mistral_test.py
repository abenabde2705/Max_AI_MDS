"""
# Dans le .env
MISTRAL_KEY=xxxxxxxx
"""
from mistralai import Mistral
from dotenv import dotenv_values
config = dotenv_values(".env")


api_key = config["MISTRAL_KEY"]
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

# Règles pour la personnalisation du chatbot Max
# CHATBOT_RULES = [
#     # Règles d'écoute et de communication
#     "1. Toujours répondre avec empathie et compréhension, même face à des messages négatifs.",
#     "2. Ne jamais minimiser les émotions exprimées par l'utilisateur.",
#     "4. Utiliser un ton bienveillant et encourageant, sans jugement.",
#     "5. Encourager l'utilisateur à continuer à parler s'il semble hésitant ou réservé.",
#     "6. Poser des questions ouvertes pour faciliter l'expression des émotions.",

#     # Règles de confidentialité et sécurité
#     "7. Ne jamais partager des informations personnelles sensibles.",
#     "8. Orienter systématiquement vers un professionnel de santé mentale si l'utilisateur exprime des idées suicidaires ou un besoin d'aide urgent.",

#     # Règles de personnalisation
#     "11. Proposer des suggestions adaptées en fonction des échanges précédents.",
#     "12. Rappeler les progrès ou échanges précédents lorsque cela est pertinent.",

#     # Règles de recommandation
#     "13. Offrir des ressources (articles, exercices, méditation) adaptées à la problématique exprimée.",
#     "14. Proposer des contacts vers des professionnels lorsque les besoins dépassent les capacités du chatbot.",

#     # Règles d'efficacité
#     "15. Répondre rapidement tout en maintenant une qualité de réponse élevée.",
#     "16. Prioriser la clarté et la concision dans les suggestions pour éviter de submerger l'utilisateur."
# ]

# system_message = "Tu es Max, un assistant empathique qui suit les règles suivantes : " + " ".join(f"{i+1}. {rule}" for i, rule in enumerate(CHATBOT_RULES))

def discuter_avec_max():
    print("Bienvenue ! Dis 'exit' pour quitter la conversation.")

    messages = [
        {
            "role": "system",
            "content": (
                "Tu es Max, un assistant empathique offrant du soutien "
                "émotionnel, agissant comme un ami virtuel avec des réponses personnalisées."
            )
        }
    ]

    while True:
        # Récupérer l'entrée utilisateur
        user_input = input("\nVous: ")
        if user_input.lower() == "exit":
            print("Au revoir !")
            break

        messages.append({"role": "user", "content": user_input})

        try:
            # Appel à l'API avec la nouvelle interface
            response = client.chat.complete(
                model=model,
                # messages = [{"role": "system", "content": system_message}],
                # messages=[
                #     {
                #         "role": "user",
                #         "content": f"Tu es Max, un assistant empathique offrant du soutien émotionnel, tu ne parles qu'en tant que max, tu prends le role d'un amis virtuel, personnalises tes reponses. Utilisateur: {
                #             user_input}",
                #     }
                # ],
                messages=messages,
                max_tokens=250,
                temperature=0.7
            )
            # Afficher la réponse de Max
            max_response = response.choices[0].message.content

            messages.append({"role": "assistant", "content": max_response})

            print(f"\n{max_response}")

        except Exception as e:
            print("Une erreur s'est produite :", e)


# to do: stock les discutions dans des json
discuter_avec_max()
