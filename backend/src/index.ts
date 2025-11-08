import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentsRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import eventsRoutes from './routes/events';
import storageRoutes from './routes/storage';
import webhookRoutes from './routes/webhook';
import notificationsRoutes from './routes/notifications';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));

// ⚠️ IMPORTANT: Le webhook Stripe doit être configuré AVANT express.json()
// car Stripe envoie les données en raw body pour vérifier la signature
app.use('/webhook', webhookRoutes);

// Middleware pour parser JSON (après le webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (en production, utiliser un logger approprié)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/payments', paymentsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/notifications', notificationsRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vybzzz Backend API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  if (NODE_ENV === 'production') {
    console.log(`✅ Production mode enabled`);
  }
});

