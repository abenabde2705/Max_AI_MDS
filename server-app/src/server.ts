import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { sequelize } from './config/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import feedbackRoutes from './routes/feedback.js';
import userRoutes from './routes/users.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import './config/passport.js';

// Monitoring imports
import pino from 'pino';
import { register, collectDefaultMetrics, Histogram, Counter } from 'prom-client';

// Configuration des variables d'environnement
import path from 'path';
import { fileURLToPath } from 'url';

// Type definitions
interface CustomError extends Error {
    status?: number;
}

interface _MetricRequest extends Request {
    startTime?: number;
}

// En development local, charger depuis .env centralisé
if (process.env.NODE_ENV !== 'production' && !process.env.DOCKER_ENV) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.join(__dirname, '../../.env') });
} else {
    // En Docker, utiliser dotenv.config() standard
    dotenv.config();
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Logger configuration
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

// Metrics configuration
collectDefaultMetrics();

// Custom metrics pour l'app
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// Middleware pour capturer les métriques
app.use((req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = (req as any).route ? (req as any).route.path : req.path;
        
        httpRequestDuration
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration);
            
        httpRequestsTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
            
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}s`,
            userAgent: req.get('user-agent')
        });
    });
    
    next();
});

// Import models to ensure they're loaded
import './models/index.js';

// Connexion à la base de données
const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully.');
        
        // Synchronize models with database - plus souple pour éviter les erreurs de migration
        try {
            await sequelize.sync({ alter: false }); // Pas d'altération forcée
            logger.info('✅ Database synchronized successfully.');
        } catch (syncError: unknown) {
            logger.warn({ syncError }, '⚠️ Database sync warning - continuing anyway');
        }
    } catch (error: unknown) {
        logger.error({ error }, '❌ Unable to connect to the database');
        process.exit(1);
    }
};

connectDB();

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (Postman, curl, Prometheus)
      if (!origin) {
        return callback(null, true);
    }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  })
);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Max AI API Documentation'
}));

// Metrics endpoint pour Prometheus
app.get('/metrics', async (req: Request, res: Response): Promise<void> => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);

// Route de test avec métrique custom
app.get('/api/health', (req: Request, res: Response): void => {
    res.json({ 
        message: 'Max AI Server is running!', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Gestion des erreurs globales
app.use((err: CustomError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error({ error: err }, 'Unhandled error');
    res.status(err.status || 500).json({ 
        message: 'Une erreur interne est survenue',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Route 404
app.use('*', (req: Request, res: Response): void => {
    res.status(404).json({ message: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    logger.info(`🚀 Max AI Server running on port ${PORT}`);
    logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
    logger.info(`📚 API Documentation at http://localhost:${PORT}/api-docs`);
    logger.info(`🩺 Health check: http://localhost:${PORT}/api/health`);
});