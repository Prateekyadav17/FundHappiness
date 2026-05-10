import axios from 'axios';

// For local development: https://fundhappiness.onrender.com
// For production: Your hosted backend URL (e.g., https://your-app.onrender.com)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fundhappiness.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export default api;
export { API_BASE_URL };
