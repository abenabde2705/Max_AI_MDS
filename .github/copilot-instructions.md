# Instructions Copilot - Max AI MDS

## 📋 Contexte du Projet

**Max AI MDS** est une application web full-stack avec un système de chat intelligent alimenté par Ollama (qwen2:3b) hébergé sur le VPS.

## 🏗️ Architecture du Projet

### Structure Multi-Services (Docker)
Le projet utilise **Docker Compose** avec 4 services principaux :

1. **PostgreSQL** (port 5432) - Base de données principale
2. **Backend Node.js** (port 3000) - API REST avec Express
3. **Frontend React** (port 5173) - Interface utilisateur avec Vite
4. **Chat API Python** (port 8000) - Service d'IA avec Ollama (qwen2:3b)

### Organisation des Dossiers

```
Max_AI_MDS/
├── server-app/          # Backend Node.js/Express
│   ├── src/
│   │   ├── server.js
│   │   ├── config/      # Configuration DB et Swagger
│   │   ├── middleware/  # Auth JWT
│   │   ├── models/      # Modèles Sequelize
│   │   ├── routes/      # Routes API REST
│   │   └── migrations/  # Migrations DB
│   └── package.json
│
├── frontend-react/      # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/  # Composants React
│   │   ├── layout/      # NavBar, Footer
│   │   ├── styles/      # CSS (gradients, buttons)
│   │   └── tests/       # Tests Vitest
│   └── package.json
│
├── chat_api/            # API Python pour Ollama (qwen2:3b)
│   ├── qwen_api.py
│   └── requirements.txt
│
├── monitoring/          # Prometheus + Grafana
├── k6/                  # Tests de charge
└── scripts/             # Scripts utilitaires
```

## 🛠️ Stack Technique

### Backend (server-app/)
- **Runtime:** Node.js avec ES Modules (`"type": "module"`)
- **Framework:** Express.js
- **ORM:** Sequelize (PostgreSQL)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Documentation:** Swagger UI
- **Monitoring:** Prometheus (prom-client)
- **Logging:** Pino
- **Tests:** Jest + Supertest
- **Linting:** ESLint

**Scripts disponibles:**
- `npm run dev` - Développement avec nodemon
- `npm run lint` - Linting avec auto-fix
- `npm test` - Exécution des tests

### Frontend (frontend-react/)
- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **Router:** React Router DOM v6
- **State Management:** Zustand
- **UI Icons:** Lucide React
- **Styling:** Tailwind CSS 4 + CSS personnalisé
- **Animations:** AOS (Animate On Scroll)
- **HTTP Client:** Axios
- **Markdown:** Marked
- **Backend Services:** Firebase (Firestore, Functions, Hosting)
- **Tests:** Vitest + Testing Library + jsdom
- **Linting:** ESLint

**Scripts disponibles:**
- `npm run dev` - Serveur de développement Vite
- `npm run build` - Build de production
- `npm test` - Tests avec Vitest
- `npm run firebase:serve` - Émulateurs Firebase

### Chat API (chat_api/)
- **Langage:** Python
- **IA:** Ollama — modèle `qwen2:3b` hébergé sur le VPS
- **Framework web:** FastAPI
- **Dépendances:** fastapi, uvicorn, ollama, pydantic, python-dotenv

### Base de Données
- **SGBD:** PostgreSQL 15
- **Accès:** Via Sequelize ORM
- **Credentials (dev):**
  - Host: postgres (Docker) / localhost
  - Database: maxai
  - User: postgres
  - Password: password
  - Port: 5432

## 🔐 Authentification

Le projet utilise **JWT (JSON Web Tokens)** pour l'authentification :
- Middleware auth dans `server-app/src/middleware/auth.js`
- Hashage des mots de passe avec bcryptjs
- Tokens gérés côté frontend

## 🎨 Frontend - Conventions de Style

### Composants Principaux
- `LandingPage.jsx` - Page d'accueil
- `Chat.jsx` / `ChatExample.jsx` - Interface de chat IA
- `Dashboard.jsx` / `DashboardSimple.jsx` - Tableaux de bord
- `Abonnement.jsx` / `PlanCard.jsx` - Gestion abonnements
- `Authentication/` - Composants d'authentification
- `Modals/` - Modales réutilisables
- `Politics/` - Pages légales

### Styles
- Fichiers CSS organisés : `styles/buttons.css`, `styles/gradients.css`
- Polices personnalisées : Articulat CF, TT Modernoir
- Utilisation de Tailwind pour le styling utilitaire

## 🧪 Tests & Qualité

### Tests Backend
- Framework: Jest
- Tests API: Supertest
- Coverage disponible avec `npm run test:coverage`

### Tests Frontend
- Framework: Vitest
- Tests composants: Testing Library
- Configuration CI séparée: `vitest.config.ci.js`
- Tests disponibles : `AuthUser.test.jsx`, `Chat.test.jsx`

### Performance
- Tests de charge K6 dans `/k6`
- Monitoring Prometheus + Grafana dans `/monitoring`
- Scripts de benchmark dans `/scripts`

### Code Quality
- ESLint configuré pour backend et frontend
- SonarQube configuré (`sonar-project.properties`)

## 🚀 Commandes Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f [service_name]

# Redémarrer un service
docker-compose restart [service_name]

# Arrêter tous les services
docker-compose down
```

## 📝 Conventions de Code

### JavaScript/React
- Utiliser ES Modules (`import/export`)
- Préférer les arrow functions
- Composants React fonctionnels avec hooks
- Extensions : `.jsx` pour les composants React, `.js` pour le reste
- Naming: PascalCase pour composants, camelCase pour fonctions/variables

### Base de données
- Migrations Sequelize dans `server-app/src/migrations/`
- Modèles Sequelize dans `server-app/src/models/`
- Indexes de performance : voir `001-add-performance-indexes.js`

### API REST
- Documentation Swagger disponible
- Routes organisées par ressource dans `server-app/src/routes/`
- Middleware d'authentification pour routes protégées

## 🔑 Variables d'Environnement

### Backend (.env dans server-app/)
```
DB_HOST=postgres
DB_NAME=maxai
DB_USER=postgres
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Chat API
```
OLLAMA_HOST=http://localhost:11434
```

## 🎯 Objectifs du Projet

- Fournir une interface de chat intelligente avec l'IA Mistral
- Système d'authentification sécurisé
- Gestion des abonnements utilisateurs
- Dashboard pour les utilisateurs
- Performance et monitoring en temps réel
- Tests automatisés et CI/CD

---
