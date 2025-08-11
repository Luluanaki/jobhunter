const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { isValidObjectId } = require('mongoose');

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


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid user id' });
  const user = await User.findById(id).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ _id: user._id.toString(), username: user.username });
});

module.exports = router;
