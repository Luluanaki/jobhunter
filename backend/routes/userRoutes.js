// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'username already taken' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    // keep response minimal
    res.status(201).json({ _id: user._id.toString(), username: user.username });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    res.json({ _id: user._id.toString(), username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/users/:id  (for your username fetch)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { username: 1 });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'bad id' });
  }
});

module.exports = router;
