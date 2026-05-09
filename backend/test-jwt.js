const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

try {
  const token = generateToken('some_id');
  console.log("Token generated:", token);
  process.exit(0);
} catch (error) {
  console.error("Token generation failed:", error.message);
  process.exit(1);
}
