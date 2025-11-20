// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  const a = await User.create({ phone: '+911234567890', name: 'Alice', wallet: 100, rewards: 10 });
  const b = await User.create({ phone: '+919876543210', name: 'Bob', wallet: 50, rewards: 5, team: [a._id] });
  console.log('seeded', a.phone, b.phone);
  process.exit();
}
run();
