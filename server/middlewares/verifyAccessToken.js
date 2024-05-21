const jwt = require('jsonwebtoken');


const verifyAccessToken = (req, res, next) => {
    // check token from header Authorization or cookie
    let token;
    if (req.headers?.authorization?.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]
    else
        return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });


    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError')
                return next(new Error('Your token has expired! Please log in again.'));
            else
                return next(new Error('Invalid token. Please log in again!'))
        }

        req.user = decoded;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!process.env.ADMIN_ROLE) {
        return res.status(500).json({ message: 'Server error. Admin role not configured.' });
    }

    if (!req.user || req.user.role !== process.env.ADMIN_ROLE) {
        return res.status(403).json({ message: 'This route is restricted to admins only!' });
    }

    next();
};

module.exports = {
    verifyAccessToken,
    requireAdmin,
};
