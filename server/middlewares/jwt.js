const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId, role)  => jwt.sign({userId, role}, process.env.JWT_SECRET, {expiresIn: '1d'});
exports.generateRefreshToken = (userId)  => jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
exports.generatePasswordResetToken = (userId)  => jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '10m'});