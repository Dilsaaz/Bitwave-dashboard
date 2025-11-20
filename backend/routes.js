// routes.js
const express = require('express');
const router = express.Router();
const { User } = require('./models');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

/*
  Twilio Verify: send OTP and verify endpoints
  - POST /send-otp  { phone }
  - POST /verify-otp { phone, code } -> returns JWT
*/

// environment: process.env.TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });

    await twilioClient.verify.services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: 'sms' });

    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to send otp', detail: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ error: 'phone & code required' });

    const check = await twilioClient.verify.services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ to: phone, code });

    if (check.status !== 'approved') return res.status(401).json({ error: 'invalid code' });

    // create or get user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone });
      await user.save();
    }

    // sign JWT
    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'verification failed', detail: err.message });
  }
});

// Middleware to validate JWT
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
};

// Protected route: get current user profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('team', 'phone name');
  if (!user) return res.status(404).json({ error: 'user not found' });
  return res.json({
    phone: user.phone,
    name: user.name,
    wallet: user.wallet,
    rewards: user.rewards,
    team: user.team
  });
});

// Example: add team member (protected) - for demo only
router.post('/team/add', auth, async (req, res) => {
  const { teamPhone } = req.body;
  if (!teamPhone) return res.status(400).json({ error: 'teamPhone required' });
  let member = await User.findOne({ phone: teamPhone });
  if (!member) {
    member = new User({ phone: teamPhone });
    await member.save();
  }
  const user = await User.findById(req.user.id);
  if (!user.team.includes(member._id)) {
    user.team.push(member._id);
    await user.save();
  }
  return res.json({ ok: true });
});

module.exports = router;
