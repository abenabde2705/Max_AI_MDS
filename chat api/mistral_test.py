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


def discuter_avec_max():
    print("Bienvenue ! Dis 'exit' pour quitter la conversation.")
    while True:
        # Récupérer l'entrée utilisateur
        user_input = input("\nVous: ")
        if user_input.lower() == "exit":
            print("Au revoir !")
            break

        try:
            # Appel à l'API avec la nouvelle interface
            response = client.chat.complete(
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": f"Tu es Max, un assistant empathique offrant du soutien émotionnel, tu ne parles qu'en tant que max, tu prends le role d'un amis virtuel, personnalises tes reponses. Utilisateur: {
                            user_input}",
                    }
                ],
                max_tokens=150,
                temperature=0.7
            )
            # Afficher la réponse de Max
            max_response = response.choices[0].message.content
            print(f"\n{max_response}")

        except Exception as e:
            print("Une erreur s'est produite :", e)


discuter_avec_max()
