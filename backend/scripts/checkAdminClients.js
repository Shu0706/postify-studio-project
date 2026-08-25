require('dotenv').config();
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@postifystudio.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

const run = async () => {
  try {
    console.log('Logging in admin...');
    const login = await axios.post(`${API}/auth/login`, { email: adminEmail, password: adminPassword });
    console.log('Login response status:', login.status);
    console.log('Login response data:', login.data);
    const token = login.data?.data?.token;
    if (!token) {
      console.error('No token returned from login');
      return process.exit(1);
    }

    console.log('Requesting /admin/clients with token...');
    const clients = await axios.get(`${API}/admin/clients`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: '' }
    });
    console.log('Clients response status:', clients.status);
    console.log('Clients data keys:', Object.keys(clients.data || {}));
    console.log(JSON.stringify(clients.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
};

run();
