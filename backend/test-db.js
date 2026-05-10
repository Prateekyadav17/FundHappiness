const mongoose = require('mongoose');
const uri = ";

console.log("Connecting to:", uri);
mongoose.connect(uri)
  .then(() => {
    console.log("Success!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed:", err);
    process.exit(1);
  });
