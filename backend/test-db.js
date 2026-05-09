const mongoose = require('mongoose');
const uri = "mongodb+srv://prateek822509_db_user:OhuRp7gkIW5BAUSp@cluster0.gogohvl.mongodb.net/crowdfunding";

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
