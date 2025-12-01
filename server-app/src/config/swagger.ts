import swaggerJsdoc from 'swagger-jsdoc';

// Configuration Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Max AI Mental Health API',
      version: '1.0.0',
      description: 'API pour l\'application Max AI - Assistant de santé mentale',
      contact: {
        name: 'Max AI Team',
        email: 'contact@maxai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.maxai.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur'
            },
            age: {
              type: 'integer',
              minimum: 13,
              description: 'Âge de l\'utilisateur'
            },
            isPremium: {
              type: 'boolean',
              description: 'Statut premium de l\'utilisateur'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de la conversation'
            },
            title: {
              type: 'string',
              description: 'Titre de la conversation'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur propriétaire'
            },
            isArchived: {
              type: 'boolean',
              description: 'Statut d\'archivage de la conversation'
            },
            emotionalContext: {
              type: 'object',
              description: 'Contexte émotionnel de la conversation'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création de la conversation'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        Message: {
          type: 'object',
          required: ['content', 'sender'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique du message'
            },
            conversationId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la conversation'
            },
            content: {
              type: 'string',
              description: 'Contenu du message'
            },
            sender: {
              type: 'string',
              enum: ['user', 'assistant'],
              description: 'Expéditeur du message'
            },
            emotionDetected: {
              type: 'string',
              nullable: true,
              description: 'Émotion détectée dans le message'
            },
            sentAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'envoi du message'
            }
          }
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de l\'abonnement'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur'
            },
            status: {
              type: 'string',
              enum: ['active', 'canceled'],
              description: 'Statut de l\'abonnement'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Date de début de l\'abonnement'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date de fin de l\'abonnement'
            }
          }
        },
        Recommendation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de la recommandation'
            },
            name: {
              type: 'string',
              description: 'Nom de la recommandation'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Description de la recommandation'
            },
            type: {
              type: 'string',
              enum: ['video', 'article', 'exercise', 'professionnel de santé'],
              description: 'Type de recommandation'
            }
          }
        },
        EmotionalJournal: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID unique de l\'entrée du journal émotionnel'
            },
            conversationId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la conversation associée'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur'
            },
            globalEmotion: {
              type: 'object',
              nullable: true,
              description: 'Pourcentage des émotions ressenties pendant une conversation'
            },
            dateLogged: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'enregistrement de l\'entrée'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            error: {
              type: 'string',
              description: 'Détails de l\'erreur'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/server.ts'], // Mis à jour pour les fichiers TypeScript
};

// Générer la documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerSpec };
export { default as swaggerUi } from 'swagger-ui-express';