require('dotenv').config();
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@postifystudio.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

const run = async () => {
  try {
    console.log('Logging in admin...');
    const login = await axios.post(`${API}/auth/login`, { email: adminEmail, password: adminPassword });
    const token = login.data?.data?.token;
    if (!token) return console.error('No token');

    console.log('Creating employee...');
    const payload = {
      firstName: 'Test',
      lastName: 'Employee',
      email: `test.employee.${Date.now()}@example.com`,
      phone: '+1234567890',
      department: 'Development',
      position: 'Developer'
    };

    const resp = await axios.post(`${API}/admin/employees`, payload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Create response status:', resp.status);
    console.log('Create response data:', resp.data);
  } catch (err) {
    if (err.response) {
      console.error('Error status:', err.response.status);
      console.error('Error data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
};

run();
