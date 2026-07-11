const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function run() {
  try {
    // 1. login to get token
    const loginRes = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rose@gmail.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.log('Login failed:', loginData);
      return;
    }
    const token = loginData.token;

    // 2. create product
    const form = new FormData();
    form.append('name', 'test');
    form.append('price', '100');
    form.append('description', 'test description');
    form.append('category', 'Sarees');
    form.append('section', 'women');
    
    // Create a dummy file
    fs.writeFileSync('test.jpg', 'fake image content');
    form.append('image', fs.createReadStream('test.jpg'));

    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
    fs.unlinkSync('test.jpg');
  } catch (err) {
    console.error(err);
  }
}

run();
