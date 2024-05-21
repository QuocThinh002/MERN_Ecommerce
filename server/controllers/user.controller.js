const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');


// [POST] api/v1/user/signup 
exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        await User.create({ fullName, email, phone, password });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] api/v1/user/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing inputs'
            })
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.isPasswordMatch(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        } else {
            const { password, role, refreshToken, ...userData } = user.toObject();
            const accessToken = generateAccessToken(user._id, role);
            const newRefreshToken = generateRefreshToken(user._id);

            await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                accessToken,
                user: userData
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] api/v1/user/
exports.getUser = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id).select('-refreshToken -password -role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] api/v1/user/logout
exports.logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.refreshToken) return res.sendStatus(204); // not refresh token
        const refreshToken = cookies.refreshToken;

        const user = await User.findOne({ refreshToken });
        console.log(user)

        // clear cookie refreshToken
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, // only send HTTPS (if using)
        });

        if (!user) 
            return res.sendStatus(204);

        // clear refreshToken from database
        user.refreshToken = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error); 
    }
};

// [POST] api/v1/user/updateUser
exports.updateUser = async (req, res) => {
    try {
        const { _id } = req.user;
        const { email, phone } = req.body;

        // // Not allowed to update password or role
        // if (req.body.password || req.body.role) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Not allowed to update password or role',
        //     });
        // }

        // if (email && !validator.isEmail(email)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid email address',
        //     });
        // }

        // if (phone && !/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(phone)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid phone number',
        //     });
        // }

        // // Check email and phone number unique
        // const existingUserEmail = await User.findOne({ email });
        // const existingUserPhone = await User.findOne({ phone });
        // if (existingUserEmail && existingUserEmail.id !== _id.toString()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Email already exists',
        //     });
        // }
        // if (existingUserPhone && existingUserPhone.id !== _id.toString()) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Phone number already exists',
        //     });
        // }

        // update user
        const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true }).select('-refreshToken -password -role');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

