import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Configuration Swagger
const swaggerOptions = {
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
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur propriétaire'
            },
            started_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de début de la conversation'
            },
            ended_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Date de fin de la conversation'
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
            conversation_id: {
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
              enum: ['user', 'ai'],
              description: 'Expéditeur du message'
            },
            sent_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date d\'envoi du message'
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
  apis: ['./src/routes/*.js', './src/server.js'], // Chemins vers les fichiers contenant les annotations
};

// Générer la documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export { swaggerSpec, swaggerUi };