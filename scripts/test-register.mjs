import fetch from 'node-fetch';

async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }),
    });
    
    const data = await response.json();
    console.log('Registration response:', data);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('Registration test failed:', error.message);
  }
}

testRegistration();
