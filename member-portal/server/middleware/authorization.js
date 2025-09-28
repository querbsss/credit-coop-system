const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = function(req, res, next) {
    // Support both custom 'token' header and standard 'Authorization: Bearer <token>'
    let jwtToken = req.header("token");
    const authHeader = req.header('authorization') || req.header('Authorization');
    if (!jwtToken && authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        jwtToken = authHeader.slice(7).trim();
    }

    if (!jwtToken) {
        return res.status(403).send("Authorization denied");
    }
    try {
        const payload = jwt.verify(jwtToken, process.env.jwtSecret);
        req.user = payload.user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(401).json("Invalid Token");
    }
};