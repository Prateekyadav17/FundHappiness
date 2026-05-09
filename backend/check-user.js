const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'prateek82250@gmail.com' });
    if (user) {
      console.log('User found:', user.email);
    } else {
      console.log('User NOT found');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
