const express = require('express');
const router = express.Router();
const User = require('../models/user');

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    let user = await User.findOne({ username });

    if (!user) {
      // If user doesn’t exist, create one
      user = new User({ username });
      await user.save();
    }

    res.json(user); // return the user object including _id
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
