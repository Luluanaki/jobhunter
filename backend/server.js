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
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobtracker';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * CORS
 * - Allow local dev and your deployed Vercel domain.
 * - Also allow any Vercel preview URL (*.vercel.app).
 * - We’re not using cookies, so `credentials` stays false.
 *
 * If you know your exact prod domain, add it to the set below.
 */
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://myjoblist.vercel.app', // your Vercel production URL
]);

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser tools (like curl / health checks without Origin)
    if (!origin) return callback(null, true);

    // exact allowlist
    if (allowedOrigins.has(origin)) return callback(null, true);

    // allow any *.vercel.app (preview deployments)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);

    // otherwise block
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: false, // set to true only if you move to cookies
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

/**
 * Routes
 */
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const userRoutes = require('./routes/userRoutes'); // exports /login, /register, /:id
app.use('/api/users', userRoutes);

// Healthcheck
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
        console.log(
          `   CORS allowlist: ${[...allowedOrigins]
            .filter(Boolean)
            .join(', ')} (+ *.vercel.app)`
        );
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

/**
 * Graceful shutdown (Render/hosting sends SIGTERM on redeploys)
 */
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing Mongo connection…');
  mongoose.connection.close(false).then(() => {
    console.log('✅ Mongo closed');
    process.exit(0);
  });
});
