import openai

openai.api_key = "my_openai_key"

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
            response = openai.completions.create(
                model="gpt-3.5-turbo",
                prompt=f"Tu es Max, un assistant empathique offrant du soutien émotionnel, tu ne parles qu'en tant que max, tu prends le role d'un amis virtuel, personnalises tes reponses. Utilisateur: {user_input}",
                max_tokens=150,
                temperature=0.7
            )
            # Afficher la réponse de Max
            max_response = response["choices"][0]["text"].strip()
            print(f"\nMax: {max_response}")

        except Exception as e:
            print("Une erreur s'est produite :", e)

# Lancer la conversation
discuter_avec_max()
