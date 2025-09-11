const jwt = require('jsonwebtoken');
require('dotenv').config();

function jwtgenerator(user_id, user_role) {
    const payload = {
        user: {
            id: user_id,
            role: user_role
        }
    }
    return jwt.sign(payload, process.env.jwt_secret, { expiresIn: '1hr' });
}

module.exports = jwtgenerator;