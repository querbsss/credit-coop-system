const e = require("express");

module.exports = (req, res, next) => {
    const { email, name, password } = req.body;

    function validEmail(userEmail) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    }

    if (req.path === '/register') {
        console.log(!email.length);
        if (![email, name, password].every(Boolean)) {
            return res.status(401).json({ error: "All fields are required" });
        } else if (!validEmail(email)) {
            return res.status(401).json({ error: "Invalid email format" });
        }
    }else if (req.path === '/login') {
        if (![email, password].every(Boolean)) {
            return res.status(401).json({ error: "All fields are required" });
        } else if (!validEmail(email)) {
            return res.status(401).json({ error: "Invalid email format" });
        }
    }
    next();
}
