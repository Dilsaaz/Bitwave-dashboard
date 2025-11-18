// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const { Admin, User, Plan, Deposit } = require('./models');
const { verifyTxOnChain } = require('./infura_sample');
const { sendTelegram, sendEmail } = require('./notify');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ------------------ AUTH MIDDLEWARE ------------------
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Not admin" });
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ------------------ ADMIN LOGIN ------------------
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json({ ok: false, error: "Admin not found" });

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return res.json({ ok: false, error: "Wrong password" });

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET);
  return res.json({ ok: true, token });
});

// ------------------ ADD USER ------------------
app.post("/admin/user/add", requireAdmin, async (req, res) => {
  const user = new User({
    fullName: req.body.fullName,
    whatsapp: req.body.whatsapp,
    email: req.body.email,
    username: req.body.username,
    country: req.body.country,
    passwordHash: await bcrypt.hash(req.body.password, 10)
  });
  await user.save();

  return res.json({ ok: true, user });
});

// ------------------ ADD PLAN ------------------
app.post("/admin/plan/add", requireAdmin, async (req, res) => {
  const plan = new Plan(req.body);
  await plan.save();
  return res.json({ ok: true, plan });
});

// ------------------ DEPOSIT SUBMIT ------------------
app.post("/deposit", async (req, res) => {
  const { userId, amount, txHash, planKey } = req.body;

  const chain = await verifyTxOnChain(txHash);

  const deposit = new Deposit({
    userId,
    amount,
    txHash,
    planKey,
    verifiedOnChain: chain.ok
  });

  await deposit.save();

  sendTelegram(`New deposit: $${amount}\nUser: ${userId}`);
  return res.json({ ok: true, deposit });
});

// ------------------ GET USER DATA ------------------
app.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  const deposits = await Deposit.find({ userId: req.params.id });
  return res.json({ ok: true, user, deposits });
});

// ------------------ START SERVER ------------------
app.listen(5000, () => console.log("Backend running on port 5000"));
app.listen(4000, () => {
   console.log("Server running");
});
