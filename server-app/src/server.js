import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';

// Configuration des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import models to ensure they're loaded
import './models/index.js';

// Connexion à la base de données
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Synchronize models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

connectDB();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Max AI API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Max AI Server is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Max AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});