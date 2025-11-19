const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
// agar models.js DB connect karta hai to:
/// require('./models');  // is line ko baad me on karenge

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Health route (browser pe jo dikhta hai)
app.get('/', (req, res) => {
  res.send('Bitwave backend is running ✅');
});

// Simple test API (frontend / Postman se test karne ke liye)
app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'API working' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
