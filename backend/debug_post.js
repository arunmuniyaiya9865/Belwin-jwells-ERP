const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testPost() {
    try {
        // We will just do a standard post like the UI does. But wait, we need a valid token.
        // I can just login as Admin first.
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin', // assuming default admin is 'admin' / '123456'
            password: 'password' // We will just check if we can get a token or if we can bypass.
        });
    } catch(err) {
        console.error("Login failed", err.message);
    }
}
testPost();
