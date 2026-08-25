require('dotenv').config();
const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

    console.log('✅ Login successful!');
    console.log('📧 Email:', response.data.data.user.email);
    console.log('👤 Name:', response.data.data.user.fullName);
    console.log('👑 Role:', response.data.data.user.role);
    console.log('🔑 Token:', response.data.data.token ? 'Generated' : 'Missing');

    // Test dashboard access
    console.log('\n📊 Testing dashboard access...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${response.data.data.token}`
      }
    });

    console.log('✅ Dashboard access successful!');
    console.log('📈 Dashboard data received:', Object.keys(dashboardResponse.data.data));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAdminLogin();
