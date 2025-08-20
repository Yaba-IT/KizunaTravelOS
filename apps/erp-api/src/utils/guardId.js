const isHex24 = require('./isHex24.js');

const guardId = (name) => (req, res, next) => {
    const val = req.params[name];
    if (val && !isHex24(val)) return res.status(400).json({ error: 'invalid_id', param: name });
    next();
};

module.exports = guardId;