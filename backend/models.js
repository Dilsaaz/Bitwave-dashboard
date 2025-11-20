// models.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true }, // e.g. +9198...
  name: { type: String, default: '' },
  wallet: { type: Number, default: 0 },
  rewards: { type: Number, default: 0 },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema)
};
