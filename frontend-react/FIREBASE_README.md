# Configuration Firebase pour Max AI React

## Configuration initiale

1. **Variables d'environnement** : Créez un fichier `.env.local` en copiant `.env.example` et remplissez vos clés Firebase :

```bash
cp .env.example .env.local
# Puis éditez .env.local avec vos vraies clés
```

2. **Initialisation Firebase** : Si ce n'est pas déjà fait, initialisez Firebase CLI :

```bash
npm install -g firebase-tools
firebase login
```

## Services utilisés

- **Firestore** : Base de données pour testimonials, newsletter, etc.
- **Authentication** : Connexion utilisateur (si activée)
- **Hosting** : Hébergement de l'application React
- **Functions** : Fonctions cloud (si nécessaires)

## Scripts disponibles

- `npm run firebase:serve` : Lance les émulateurs Firebase localement
- `npm run firebase:deploy` : Build et déploie tout (hosting + functions)
- `npm run firebase:deploy:hosting` : Déploie seulement l'application
- `npm run firebase:deploy:functions` : Déploie seulement les functions

## Collections Firestore utilisées

- `testimonials` : Témoignages des utilisateurs
- `newsletter` : Inscriptions à la newsletter
- `conversations` : Historique des chats (si nécessaire)

## Configuration du projet Firebase

- Project ID : `max-ai-66f16`
- Auth Domain : `max-ai-66f16.firebaseapp.com`
- Storage Bucket : `max-ai-66f16.appspot.com`

## Sécurité

- Toutes les variables sensibles sont dans `.env.local` (non versionné)
- Les règles Firestore doivent être configurées dans la console Firebase
- L'authentification est optionnelle selon vos besoins