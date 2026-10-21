require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const propertyRoutes = require('./src/routes/propertyRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Liveness check
app.get('/', (req, res) => {
  res.json({ success: true, message: '🏠 RealEstate API is running!' });
});

// Readiness check
app.get('/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ready' : 'not_ready',
    database: ready ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api', interactionRoutes);
app.use('/api/properties', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  const status = err.message === 'Origin is not allowed by CORS.' ? 403 : 500;
  res.status(status).json({
    success: false,
    message: status === 403 ? err.message : 'Internal Server Error.',
  });
});

const PORT = process.env.PORT || 5000;

const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
if (process.env.NODE_ENV === 'production') {
  requiredEnv.push(
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
  );
}
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim());

if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received; closing HTTP server.`);
    server.close(() => {
      mongoose.disconnect()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error('Error closing MongoDB connection:', error.message);
          process.exit(1);
        });
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};

start().catch((error) => {
  console.error('Unable to start API server:', error.message);
  process.exit(1);
});
