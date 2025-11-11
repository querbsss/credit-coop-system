const e = require("express");

module.exports = (req, res, next) => {
    const { empnumber, name, password } = req.body;

    if (req.path === '/register') {
        if (![empnumber, name, password].every(Boolean)) {
            return res.status(401).json({ error: "All fields are required" });
        }
    } else if (req.path === '/login') {
        if (![empnumber, password].every(Boolean)) {
            return res.status(401).json({ error: "All fields are required" });
        }
    }
    next();
}
