const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

function jwtGenerator(user_id) {
    const payload = {
        user: user_id
    };

    // Use a standard JWT expiry format (e.g., '1h')
    return jwt.sign(payload, process.env.jwtSecret, { expiresIn: '1h' });
}

module.exports = jwtGenerator;