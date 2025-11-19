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
// User schema ke andar, jahan name, phone, password waale fields hain
referralCode: {
  type: String,
  unique: true,
  index: true,
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

team: {
  l1: { type: Number, default: 0 }, // direct team
  l2: { type: Number, default: 0 }, // 2nd level
  l3: { type: Number, default: 0 }, // 3rd level
},
