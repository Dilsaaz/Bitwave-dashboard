// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { Admin, Plan } = require('./models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log("DB Connected");

  // ---- Add Admin ----
  const adminExists = await Admin.findOne({ email: "admin@bitwave.com" });

  if (!adminExists) {
    await Admin.create({
      email: "admin@bitwave.com",
      passwordHash: "$2b$10$aUgf1FGNYeY0ufp8NnwKiuuHxf9R5NfH3tZSBq1OIwYQTJ7pEaZiq" // password = admin123
    });
    console.log("Admin Created ✔");
  } else {
    console.log("Admin Already Exists");
  }

  // ---- Add Plans ----
  const plans = [
    {
      key: "starter",
      name: "Starter",
      durationDays: 7,
      multiplier: 1.20
    },
    {
      key: "basic",
      name: "Basic",
      durationDays: 15,
      multiplier: 1.40
    },
    {
      key: "pro",
      name: "Pro",
      durationDays: 30,
      multiplier: 1.80
    }
  ];

  for (let p of plans) {
    const exists = await Plan.findOne({ key: p.key });
    if (!exists) {
      await Plan.create(p);
      console.log(`Plan added: ${p.name}`);
    } else {
      console.log(`Plan exists: ${p.name}`);
    }
  }

  console.log("Seeding completed ✔");

  process.exit(0);
}

seed();
