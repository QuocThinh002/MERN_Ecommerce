const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

const sendEmail = require('../ultils/sendMail');
const { generateAccessToken, generateRefreshToken, generatePasswordResetToken } = require('../middlewares/jwt');


// [POST] /auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing inputs'
            })
        }
        // const explainResult = await User.find({ email }).explain();
        // console.log(explainResult);
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email is not registered' });
        } else if (!(await user.isPasswordMatch(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        } else {
            if (!user.isActive) return res.status(403).json({ success: false, message: "Account is blocked." });

            const { password, role, refreshToken, ...userData } = user.toObject();
            const accessToken = generateAccessToken(user.id, role);
            const newRefreshToken = generateRefreshToken(user.id);

            // Update refreshToken in the database
            user.refreshToken = newRefreshToken;
            await user.save({ validateBeforeSave: false });
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                accessToken,
                user: userData
            })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [POST] /auth/logout
exports.logout = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        if (!cookies?.refreshToken) return res.sendStatus(204); // not refresh token
        const refreshToken = cookies.refreshToken;

        const user = await User.findOne({ refreshToken });

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

// [POST] /auth/forgotPassword
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        const passwordResetToken = generatePasswordResetToken(user.id);
        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${passwordResetToken}`;
        // HTML email content

        const subject = 'Forgot Password StudyHard';
        const html = `
            <div style="background-color: #f5f5f5; padding: 20px;">
                <h2 style="color: #333; text-align: center;">StudyHard - Password Reset</h2>
                <p style="color: #666; text-align: center;">Dear <b>${user.fullName}</b>, You requested a password reset. Please click the button below to reset your password:</p>
                <div style="text-align: center;">
                    <a href="${resetURL}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p style="color: #666; text-align: center;">This link is valid for only 10 minutes.</p>
                    <p style="color: #666; text-align: center;">If you did not request a password reset, please ignore this email.</p>
                </div>
            </div>
            `;


        const info = await sendEmail({ email, subject, html });
        res.status(200).json({ success: true, info })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// [POST] /auth/resetPassword
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const decodeToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decodeToken.userId, passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
        if (!user) return res.status(401).json({ success: false, message: 'Token is invalid or has expired.' });

        user.password = req.body.password;
        user.passwordChangedAt = Date.now();
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save();

        const email = user.email;
        const subject = 'StudyHard Password Reset Confirmation';
        const html = `
            <div style="background-color: #f5f5f5; padding: 20px;">
                <p>Hi <b>${user.fullName}</b>, <br>Your password has been successfully changed. If you did not request this change, please contact us immediately at <b>support@studyhard.com</b>.</p>
                <p>Sincerely,</p>
                <p>StudyHard</p>
            </div>
            `;


        const info = await sendEmail({ email, subject, html });
        res.status(200).json({ success: true, message: 'Password reset successfully', info })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
