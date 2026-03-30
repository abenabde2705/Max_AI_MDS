import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
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
import journalRoutes from './routes/journal.js';
import subscriptionRoutes from './routes/subscriptions.js';
import stripeWebhookRouter from './routes/webhooks.js';
import studentVerificationRoutes from './routes/studentVerification.js';
import adminRoutes from './routes/admin.js';
import newsletterRoutes from './routes/newsletter.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';
import './config/passport.js';
import { up as migration001 } from './migrations/001-add-performance-indexes.js';
import migration002 from './migrations/002-add-oauth-fields.js';
import migration003 from './migrations/003-allow-null-password.js';
import { up as migration004 } from './migrations/004-extend-emotional-journal.js';
import { up as migration005 } from './migrations/005-extend-subscriptions.js';
import { up as migration006 } from './migrations/006-create-student-verifications.js';
import { up as migration007 } from './migrations/007-add-user-role-and-stripe.js';
import { up as migration008 } from './migrations/008-create-crisis-alerts.js';
import { up as migration009 } from './migrations/009-add-reset-token.js';
import { up as migration010 } from './migrations/010-create-stripe-webhook-events.js';
import { up as migration011 } from './migrations/011-add-birth-date.js';
import { up as migration012 } from './migrations/012-drop-unused-columns.js';
import { up as migration013 } from './migrations/013-add-login-lockout.js';
import { startSubscriptionExpiryJob } from './jobs/subscriptionExpiry.js';

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

// Vérification des variables d'environnement critiques au démarrage
const REQUIRED_ENV = ['JWT_SECRET', 'SESSION_SECRET'];
for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.error(`❌ Variable d'environnement manquante : ${key}`);
        process.exit(1);
    }
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ⚠️ Webhook Stripe — doit être monté AVANT express.json() pour préserver le raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

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

// Runner de migrations — ignore les colonnes déjà existantes
const runMigrations = async (): Promise<void> => {
    const qi = sequelize.getQueryInterface();
    const migrations = [
        { name: '001', fn: () => migration001(qi, sequelize.constructor as any) },
        { name: '002', fn: () => migration002.up(qi) },
        { name: '003', fn: () => migration003.up(qi) },
        { name: '004', fn: () => migration004(qi, sequelize.constructor as any) },
        { name: '005', fn: () => migration005(qi, sequelize.constructor as any) },
        { name: '006', fn: () => migration006(qi, sequelize.constructor as any) },
        { name: '007', fn: () => migration007(qi, sequelize.constructor as any) },
        { name: '008', fn: () => migration008(qi, sequelize.constructor as any) },
        { name: '009', fn: () => migration009(qi, sequelize.constructor as any) },
        { name: '010', fn: () => migration010(qi, sequelize.constructor as any) },
        { name: '011', fn: () => migration011(qi, sequelize.constructor as any) },
        { name: '012', fn: () => migration012(qi, sequelize.constructor as any) },
        { name: '013', fn: () => migration013(qi, sequelize.constructor as any) },
    ];

    for (const migration of migrations) {
        try {
            await migration.fn();
            logger.info(`✅ Migration ${migration.name} applied`);
        } catch (err: any) {
            const msg: string = err?.message ?? '';
            if (msg.includes('already exists') || msg.includes('duplicate column')) {
                logger.info(`⏭️ Migration ${migration.name} already applied, skipping`);
            } else {
                logger.warn(`⚠️ Migration ${migration.name} warning: ${msg}`);
            }
        }
    }
};

// Connexion à la base de données
const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully.');

        await runMigrations();

        try {
            await sequelize.sync({ alter: false });
            logger.info('✅ Database synchronized successfully.');
        } catch (syncError: unknown) {
            logger.warn({ syncError }, '⚠️ Database sync warning - continuing anyway');
        }
    } catch (error: unknown) {
        logger.error({ error }, '❌ Unable to connect to the database');
        process.exit(1);
    }
};

connectDB().then(() => {
  startSubscriptionExpiryJob();
});

// Middlewares
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Requête sans header Origin (curl, Postman, server-to-server)
    // Autorisé en dev uniquement — en prod les browsers envoient toujours Origin
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// CORS appliqué uniquement sur /api — /metrics reste accessible à Prometheus (server-to-server)
app.use('/api', cors(corsOptions));
app.options('/api/*', cors(corsOptions));

app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés (cartes étudiantes)
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads')));

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation (dev/staging only)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Max AI API Documentation'
    }));
} else {
    app.use('/api-docs', (_req, res: Response) => {
        res.status(404).json({ message: 'Not found' });
    });
}

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
app.use('/api/journal', journalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api', studentVerificationRoutes);
app.use('/api', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);

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
    const body: Record<string, string> = { message: 'Une erreur interne est survenue' };
    if (process.env.NODE_ENV !== 'production') { body.error = err.message; }
    res.status(err.status || 500).json(body);
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