// Test script to verify API authentication
const testAuth = async () => {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    console.log('Testing login...');
    
    // Test login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@postifystudio.com',
        password: 'admin123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    console.log('Token obtained:', token);
    
    // Test profile fetch
    console.log('Testing profile fetch...');
    const profileResponse = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const profileData = await profileResponse.json();
    console.log('Profile response:', profileData);
    
    if (profileData.success) {
      console.log('✅ Authentication flow works correctly!');
      console.log('User:', profileData.data.user);
    } else {
      console.error('❌ Profile fetch failed:', profileData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testAuth();
