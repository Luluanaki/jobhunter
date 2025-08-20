// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/**
 * Env
 */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobtracker';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * CORS
 * - Allows your local frontend and your deployed Vercel URL.
 * - If you use Vercel preview URLs, we also allow *.vercel.app by pattern.
 * - We’re not using cookies, so `credentials` remains false.
 */
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  FRONTEND_URL,
]);

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser tools (like curl / health checks without Origin)
    if (!origin) return callback(null, true);

    // allow exact matches
    if (allowedOrigins.has(origin)) return callback(null, true);

    // allow *.vercel.app (preview/prod)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);

    // otherwise block
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

/**
 * Routes
 */
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const userRoutes = require('./routes/userRoutes'); // must export /login, /register, /:id, etc.
app.use('/api/users', userRoutes);

// Simple healthcheck for Render
app.get('/health', (_req, res) => res.json({ ok: true, env: NODE_ENV }));

/**
 * DB + Start
 */
mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URI, { autoIndex: NODE_ENV !== 'production' })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      if (NODE_ENV !== 'production') {
        console.log(`   CORS allowed for: ${[...allowedOrigins].filter(Boolean).join(', ')} (+ *.vercel.app)`);
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * Optional: graceful shutdown (Render sends SIGTERM on redeploys)
 */
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing Mongo connection…');
  mongoose.connection.close(false).then(() => {
    console.log('✅ Mongo closed');
    process.exit(0);
  });
});
