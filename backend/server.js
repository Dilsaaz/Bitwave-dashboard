// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI;
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo connected'))
  .catch(e => console.error('mongo error', e));

app.use('/api', routes);

// health
app.get('/', (req, res) => res.send('Bitwave API running'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server started on', port));
