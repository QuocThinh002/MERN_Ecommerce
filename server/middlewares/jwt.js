const jwt = require('jsonwebtoken');

exports.generateToken = (uid, role)  => jwt.sign({_id: uid, role}, process.env.JWT_SECRET, {expiresIn: '1d'});
exports.generateRefreshToken = (uid)  => jwt.sign({_id: uid}, process.env.JWT_SECRET, {expiresIn: '7d'});