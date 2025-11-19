// backend/models.js
const mongoose = require("mongoose");

// ----- User -----
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Referral system
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Finance
    balanceUSD: { type: Number, default: 0 },
    teamVolumeUSD: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ----- Transaction -----
const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "profit", "bonus"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USDT" },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "completed",
    },
    note: { type: String },
  },
  { timestamps: true }
);

// ----- Daily Profit Snapshot (optional, future use) -----
const profitSnapshotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    profitAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Models
const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const ProfitSnapshot = mongoose.model(
  "ProfitSnapshot",
  profitSnapshotSchema
);

module.exports = {
  User,
  Transaction,
  ProfitSnapshot,
};
