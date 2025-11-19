// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("./models");
// Unique referral code generator
async function generateReferralCode(UserModel) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (true) {
    let code = "BW"; // prefix
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const existing = await UserModel.findOne({ referralCode: code });
    if (!existing) return code;
  }
}
// Unique referral code generator
async function generateReferralCode(UserModel) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (true) {
    let code = "BW"; // prefix fixed
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    const existing = await UserModel.findOne({ referralCode: code });
    if (!existing) return code; // unique mil gaya
  }
}
const app = express();

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bitwave";
const JWT_SECRET = process.env.JWT_SECRET || "bitwave-secret";

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== DB CONNECT ======
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ====== HELPER: AUTH MIDDLEWARE ======
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, message: "No token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

// ====== BASIC ROUTE ======
app.get("/", (req, res) => {
  res.send("Bitwave backend is running ✅");
});

// ====== AUTH & USER ROUTES ======

/**
 * Fake OTP system:
 * - Client bhejega phone number
 * - Backend hamesha  "1234" OTP return karega (sirf demo ke liye)
 * Real SMS baad me integrate kar sakte hain
 */
app.post("/api/auth/request-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ ok: false, message: "Phone required" });
  }
  // Normally yahan SMS gateway call hota
  return res.json({ ok: true, otp: "1234" });
});

// Register: phone + password + otp
app.post("/api/auth/register", async (req, res) => {
  try {
    const { phone, password, otp } = req.body;

    if (!phone || !password || !otp) {
      return res
        .status(400)
        .json({ ok: false, message: "phone, password, otp required" });
    }

    if (otp !== "1234") {
      return res.status(400).json({ ok: false, message: "Wrong OTP" });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res
        .status(400)
        .json({ ok: false, message: "Phone already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // default earnings 0
    const user = await User.create({
      phone,
      passwordHash,
      dailyIncomeUSD: 0,
      totalRewardUSD: 0,
      levelIncomeUSD: 0,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        dailyIncomeUSD: user.dailyIncomeUSD,
        totalRewardUSD: user.totalRewardUSD,
        levelIncomeUSD: user.levelIncomeUSD,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Login: phone + password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "phone & password required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ ok: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ ok: false, message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        dailyIncomeUSD: user.dailyIncomeUSD,
        totalRewardUSD: user.totalRewardUSD,
        levelIncomeUSD: user.levelIncomeUSD,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Current user + earnings
app.get("/api/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    res.json({ ok: true, user });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Simple endpoint admin ke liye manual earning update (future)
app.post("/api/admin/update-earnings", authRequired, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ ok: false, message: "Not allowed" });
    }
    const { userId, dailyIncomeUSD, totalRewardUSD, levelIncomeUSD } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { dailyIncomeUSD, totalRewardUSD, levelIncomeUSD },
      { new: true }
    ).select("-passwordHash");
    res.json({ ok: true, user });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Bitwave backend listening on port ${PORT}`);
});app.get("/api/me", async (req, res) => {
  try {
    const { phone } = req.query;
    const user = await User.findOne({ phone });

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      phone: user.phone,
      referralCode: user.referralCode,
      team: user.team,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
