const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');

// GET all jobs
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const jobs = await Job.find({ userId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ _id: user._id.toString(), username: user.username });
  } catch (err) {
    console.error('Get user error:', err);
    // invalid ObjectId or other error
    return res.status(400).json({ error: 'Invalid user id' });
  }
});

// POST /api/jobs
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'username is required' });
    }

    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({ username });
    }

    res.json({ _id: user._id.toString(), username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { company, title, location, date, source, url, status, userId } = req.body;

  try {
    const newJob = new Job({ company, title, location, date, source, url, status, userId });
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    console.error('Error saving job:', err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

module.exports = router;


// PUT (full update)
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH (status update)
router.patch('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.body.status !== undefined) {
      job.status = req.body.status;
    }

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;