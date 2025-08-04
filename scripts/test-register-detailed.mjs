import fetch from 'node-fetch';

async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
        password: 'password123',
        name: 'Test User 2'
      }),
    });
    
    const text = await response.text();
    console.log('Registration response text:', text);
    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers.entries()]);
    
  } catch (error) {
    console.error('Registration test failed:', error);
  }
}

testRegistration();
