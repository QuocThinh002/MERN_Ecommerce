const validator = require('validator');
const User = require('../models/user.model');

exports.checkDuplicate = async (req, res, next) => {
    const { email, phone } = req.body;
    const userId = req.user?._id;

    try {

        if (email && (await User.findOne({ email, _id: { $ne: userId } }))) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists',
            });
        }


        if (phone && (await User.findOne({ phone, _id: { $ne: userId } }))) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during validation',
        });
    }
};

exports.signup = (req, res, next) => {
    const { fullName, email, phone, password } = req.body;


    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required for signup',
        });
    }


    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email address',
        });
    }


    if (!/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number',
        });
    }

    next();
};



exports.update = (req, res, next) => {
    if (req.body.password || req.body.role) {
        return res.status(400).json({
            success: false,
            message: 'Not allowed to update password or role',
        });
    }

    next();
};
