// backend/models.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // mobile number
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // Earning fields
    dailyIncomeUSD: { type: Number, default: 0 },
    totalRewardUSD: { type: Number, default: 0 },
    levelIncomeUSD: { type: Number, default: 0 },

    // Other info
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
