const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const User = require('./models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const uri = process.env.MONGO_URI;

async function testRegister() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${testEmail}`);

    const user = await User.create({
      name: "Test User",
      email: testEmail,
      password: "password123",
      role: "donor"
    });

    console.log("User created successfully:", user._id);
    await User.deleteOne({ _id: user._id });
    console.log("Test user deleted");
    
    process.exit(0);
  } catch (error) {
    console.error("Registration failed with error:");
    console.error(error);
    process.exit(1);
  }
}

testRegister();
