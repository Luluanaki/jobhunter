// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

// helpful unique index
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
