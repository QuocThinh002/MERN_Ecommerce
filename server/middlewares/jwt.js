const jwt = require('jsonwebtoken');

exports.generateAccessToken = (uid, role)  => jwt.sign({id: uid, role}, process.env.JWT_SECRET, {expiresIn: '1d'});
exports.generateRefreshToken = (uid)  => jwt.sign({id: uid}, process.env.JWT_SECRET, {expiresIn: '7d'});