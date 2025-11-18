const mongoose = require("mongoose");
const { Plan } = require("./models");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seed() {
  await Plan.deleteMany({});

  await Plan.insertMany([
    {
      key: "basic",
      name: "Basic Plan",
      durationDays: 7,
      multiplier: 1.2,
      minAmount: 10,
    },
    {
      key: "standard",
      name: "Standard Plan",
      durationDays: 15,
      multiplier: 1.5,
      minAmount: 25,
    },
    {
      key: "premium",
      name: "Premium Plan",
      durationDays: 30,
      multiplier: 2.0,
      minAmount: 50,
    },
  ]);

  console.log("Seed data created");
  process.exit();
}

seed();
