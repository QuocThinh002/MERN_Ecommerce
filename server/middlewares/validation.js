const validator = require('validator');
const User = require('../models/user.model');

// Function to validate email format
const validateEmail = (email) => {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email address');
    }
};

// Function to validate phone number format
const validatePhone = (phone) => {
    if (!/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(phone)) {
        throw new Error('Invalid phone number');
    }
};

// Function to validate password strength
const validatePassword = (password) => {
    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        throw new Error('Password must be at least 8 characters long and contain at least one lowercase, one uppercase, one number, and one symbol');
    }
};

const checkExistEmail = async (email) => {
    if (email && (await User.findOne({ email }).lean())) {
        throw new Error('Email already exists');
    }
}

const checkExistPhone = async (phone) => {
    if (phone && (await User.findOne({ phone }).lean())) {
        throw new Error('Phone already exists');
    }
}


// Middleware to check for duplicate email number
const checkDuplicateEmail = async (email, userId) => {
    // Check if email already exists, excluding the current user
    if (email && (await User.findOne({ email, _id: { $ne: userId } }).lean())) {
        throw new Error('Email already exists');
    }
};

// Middleware to check for duplicate email and phone number
const checkDuplicatePhone = async (phone, userId) => {
    // Check if phone number already exists, excluding the current user
    if (phone && (await User.findOne({ phone, _id: { $ne: userId } }).lean())) {
        throw new Error('Phone number already exists');
    }
};

// Middleware to validate signup input fields
exports.signup = (req, res, next) => {
    const { fullName, email, phone, password } = req.body;

    try {
        // Check if all required fields are present
        if (!fullName || !email || !phone || !password) {
            throw new Error('All fields are required for signup');
        }

        // Validate email, phone, and password
        validateEmail(email);
        validatePhone(phone);
        validatePassword(password);

        checkExistEmail(email);
        checkExistPhone(phone);

        next();
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



// Middleware to validate input fields for updating user information
exports.updateUser = (req, res, next) => {
    const { email, phone } = req.body;
    const { _id } = req.user;

    try {
        // Disallow updating password or role
        if (req.body.password || req.body.role) {
            throw new Error('Not allowed to update password or role');
        }

        // Validate email and phone if they are being updated
        if (email) validateEmail(email);
        if (phone) validatePhone(phone);

        checkDuplicateEmail(email, _id);
        checkDuplicatePhone(phone, _id);

        next();
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Middleware to validate change password input fields
exports.changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    try {
        // Check if both current and new passwords are provided
        if (!currentPassword || !newPassword) {
            throw new Error('Current password and new password are required');
        }

        // Validate the strength of the new password
        validatePassword(newPassword);


        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await user.isPasswordMatch(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        next();
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
