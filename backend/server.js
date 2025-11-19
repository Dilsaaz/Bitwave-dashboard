// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User, Transaction } = require("./models");

const app = express();

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== DB CONNECT ======
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ====== HELPER: AUTH MIDDLEWARE ======
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "No token provided" });
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

// ====== AUTH ROUTES ======

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email, phone, referralCode } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "username & password required" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res
        .status(400)
        .json({ ok: false, message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // generate referral code
    const myReferral = username.toLowerCase() + "-" + Date.now().toString(36);

    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
    }

    const user = await User.create({
      username,
      email,
      phone,
      passwordHash,
      referralCode: myReferral,
      referredBy: referredByUser ? referredByUser._id : undefined,
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
        username: user.username,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "username & password required" });
    }

    const user = await User.findOne({ username });
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
        username: user.username,
        role: user.role,
        referralCode: user.referralCode,
        balanceUSD: user.balanceUSD,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Current user info
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

// Simple route to add transaction (future: admin only)
app.post("/api/transactions", authRequired, async (req, res) => {
  try {
    const { type, amount, note } = req.body;
    if (!type || !amount) {
      return res
        .status(400)
        .json({ ok: false, message: "type & amount required" });
    }

    const tx = await Transaction.create({
      user: req.userId,
      type,
      amount,
      note,
    });

    // balance update (simple version)
    if (type === "deposit" || type === "profit" || type === "bonus") {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { balanceUSD: amount },
      });
    } else if (type === "withdraw") {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { balanceUSD: -amount },
      });
    }

    res.json({ ok: true, tx });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Get my transactions
app.get("/api/transactions", authRequired, async (req, res) => {
  try {
    const list = await Transaction.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ ok: true, items: list });
  } catch (err) {
    console.error("Get tx error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`🚀 Bitwave backend listening on port ${PORT}`);
});
