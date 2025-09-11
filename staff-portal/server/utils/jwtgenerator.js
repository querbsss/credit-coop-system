const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtgenerator(user_id) {
    const payload = {
        user: user_id
    }
    return jwt.sign(payload, process.env.jwt_secret, { expiresIn: '1hr' });
}

module.exports = jwtgenerator;