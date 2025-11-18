// backend/models.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema({
  fullName: String,
  whatsapp: String,
  email: String,
  country: String,
  username: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

const PlanSchema = new Schema({
  key: { type: String, unique: true },
  name: String,
  durationDays: Number,
  multiplier: Number,
  description: String
});

const DepositSchema = new Schema({
  fullName: String,
  whatsapp: String,
  email: String,
  country: String,
  stakeAmount: Number,
  planKey: String,
  txHash: String,
  customAmountOpt: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: Date,
  approvedAt: Date,
  rejectedAt: Date
});

const StakeSchema = new Schema({
  depositId: { type: Schema.Types.ObjectId, ref: 'Deposit' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  stakeAmount: Number,
  planKey: String,
  startDate: Date,
  endDate: Date,
  expectedProfit: Number,
  status: { type: String, enum: ['active','completed','cancelled'], default: 'active' }
});

module.exports = {
  Admin: mongoose.model('Admin', AdminSchema),
  User: mongoose.model('User', UserSchema),
  Plan: mongoose.model('Plan', PlanSchema),
  Deposit: mongoose.model('Deposit', DepositSchema),
  Stake: mongoose.model('Stake', StakeSchema)
};
