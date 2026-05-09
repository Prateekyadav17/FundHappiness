const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const uri = process.env.MONGO_URI;

console.log("Connecting to:", uri);
mongoose.connect(uri)
  .then(() => {
    console.log("Success!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed:", err.message);
    process.exit(1);
  });
