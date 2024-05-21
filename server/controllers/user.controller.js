const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const sendEmail = require('../ultils/sendMail');

const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwt');


// [POST] api/v1/user/signup 
exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        await User.create({ fullName, email, phone, password });

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

// [GET] api/v1/user/current
exports.getUser = async (req, res) => {
    try {
        const { _id } = req.user;
        console.log(req.user)
        const user = await User.findById(_id).lean().select('-refreshToken -password -role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] api/v1/user/allUsers 
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean().select('-refreshToken -password -cart -wishlist -addresses');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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

// [PATCH] api/v1/user/updateUser
exports.updateUser = async (req, res) => {
    try {
        const { _id } = req.user;

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

// [PACTH] api/v1/user/changePassword
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { _id } = req.user;

        await User.findByIdAndUpdate(_id, { password: newPassword, passwordChangedAt: Date.now() });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] api/v1/user/forgotPassword
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        const subject = 'Forgot Password - StudyHard';
        const resetToken = user.generatePasswordResetToken();
        await user.save();
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

        // HTML email content
        const html = `
            <div style="background-color: #f5f5f5; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p style="color: #666; text-align: center;">You requested a password reset. Please click the button below to reset your password:</p>
                <div style="text-align: center;">
                <a href="${resetURL}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p style="color: #666; text-align: center;">This link is valid for only 10 minutes.</p>
                <p style="color: #666; text-align: center;">If you did not request a password reset, please ignore this email.</p>
            </div>
            `;
        const info = await sendEmail({ email, subject, html });
        res.status(200).json({success: true, info})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}