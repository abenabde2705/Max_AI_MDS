const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Données JSON
const data = {
  questions: [
    "Je me sens dépassé en ce moment.",
    "C’est surtout au travail, trop de responsabilités.",
    "Non, je ne sais pas comment aborder le sujet avec eux.",
    "Merci, je vais essayer la respiration."
  ],
  responses: {
    "Je me sens dépassé en ce moment.": "Je suis désolé d’apprendre que vous ressentez cela. Pouvez-vous m'en dire un peu plus ? Est-ce lié à votre travail, à vos relations, ou à autre chose ?",
    "C’est surtout au travail, trop de responsabilités.": "Je comprends, les responsabilités au travail peuvent être écrasantes parfois. Est-ce que vous avez eu l'occasion de parler de cela avec vos collègues ou votre supérieur ?",
    "Non, je ne sais pas comment aborder le sujet avec eux.": "C’est normal de se sentir ainsi. Parfois, partager vos ressentis peut soulager la pression. Souhaitez-vous quelques conseils pour en parler ? Ou préférez-vous explorer des techniques pour gérer cette anxiété en attendant ?",
    "Merci, je vais essayer la respiration.": "C’est un excellent choix ! N’oubliez pas que vous faites de votre mieux, et chaque petit pas compte. Si vous avez besoin de moi à nouveau, je suis toujours là pour vous. Prenez soin de vous ! 💚"
  }
};

// Endpoint pour récupérer toutes les questions (facultatif, mais utile pour debugging ou frontend)
app.get('/api/questions', (req, res) => {
  res.json({ questions: data.questions });
});

// Endpoint pour gérer les questions/réponses
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  // Trouver la réponse correspondante
  const response = data.responses[message];

  if (response) {
    res.json({ reply: response });
  } else {
    res.status(404).json({
      reply: "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ou préciser ? (suivez le script pour l'instant 😉)"
    });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
