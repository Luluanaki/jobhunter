// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobtracker';

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(express.json());

// Routes
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const userRoutes = require('./routes/userRoutes'); // must export /login and /:id
app.use('/api/users', userRoutes);

// (Optional) healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// MongoDB Connection + server start
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
