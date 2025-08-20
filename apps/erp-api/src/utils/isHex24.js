const isHex24 = (v) => /^[a-fA-F0-9]{24}$/.test(v);

module.exports = isHex24;