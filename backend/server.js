const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// agar tumhara models.js DB connect karta hai to use require kar lo:
require('./models'); // optional, lekin rakha to DB connect ho jayega

const app = express();

// middlewares
app.use(cors());
app.use(bodyParser.json());

// simple test route
app.get('/', (req, res) => {
  res.send('Bitwave backend is running ✅');
});

// Render ke PORT pe listen karo
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
