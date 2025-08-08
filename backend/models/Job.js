const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: String,
  title: String,
  location: String,
  date: String,
  source: String,
  url: String,
  status: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Job', jobSchema);