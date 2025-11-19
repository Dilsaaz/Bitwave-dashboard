const express = require('express');
const app = express();

// test route
app.get('/', (req, res) => {
  res.send('Bitwave backend is running ✅');
});

// Render ka PORT use karo
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
