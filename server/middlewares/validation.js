const validator = require('validator');
const User = require('../models/user.model');

// Function to validate email format
const validateEmail = (email) => {
    if (email && !validator.isEmail(email)) return { message: 'Invalid email address' };
};

// Function to validate phone number format
const validatePhone = (phone) => {
    if (phone && !/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(phone)) return { message: 'Invalid phone number' };
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
        return {
            message: 'Password must be at least 8 characters long and contain at least one lowercase, one uppercase, one number, and one symbol'
        };
    }
};

const checkExistEmail = async (email) => {
    if (email && (await User.findOne({ email }).lean())) return { message: 'Email already exists' };
}

const checkExistPhone = async (phone) => {
    if (phone && (await User.findOne({ phone }).lean())) return { message: 'Phone already exists' };
}

// Middleware to check for duplicate email number
const checkDuplicateEmail = async (email, userId) => {
    // Check if email already exists, excluding the current user
    if (email && (await User.findOne({ email, _id: { $ne: userId } }).lean()))
        return { message: 'Email already exists' };
};

// Middleware to check for duplicate email and phone number
const checkDuplicatePhone = async (phone, userId) => {
    // Check if phone number already exists, excluding the current user
    if (phone && (await User.findOne({ phone, _id: { $ne: userId } }).lean()))
        return { message: 'Phone number already exists' };
};

// Middleware to validate signup input fields
exports.signup = async (req, res, next) => {
    const { fullName, email, phone, password } = req.body;

    try {
        // Check if all required fields are present
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required for signup' });
        }

        // Validate email, phone, and password
        let errors = [];
        const emailError = validateEmail(email);
        const phoneError = validatePhone(phone);
        const passwordError = validatePassword(password);
        const existingEmailError = await checkExistEmail(email);
        const existingPhoneError = await checkExistPhone(phone);

        if (emailError) errors.push(emailError);
        if (phoneError) errors.push(phoneError);
        if (passwordError) errors.push(passwordError);
        if (existingEmailError) errors.push(existingEmailError);
        if (existingPhoneError) errors.push(existingPhoneError);

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message }); // Use return for clarity
    }
};

// Middleware to validate input fields for updating user information
exports.updateUser = async (req, res, next) => {
    const { email, phone } = req.body;
    const { userId } = req.user;

    try {
        // Disallow updating password or role
        if (req.body.password || req.body.role) {
            return res.status(400).json({ success: false, message: 'Not allowed to update password or role' });
        }
        let errors = [];
        const emailError = validateEmail(email);
        const phoneError = validatePhone(phone);
        const duplicateEmailError = await checkDuplicateEmail(email, userId);
        const duplicatePhoneError = await checkDuplicatePhone(phone, userId);

        if (emailError) errors.push(emailError);
        if (phoneError) errors.push(phoneError);
        if (duplicateEmailError) errors.push(duplicateEmailError);
        if (duplicatePhoneError) errors.push(duplicatePhoneError);

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message }); // Use return for clarity
    }
};

exports.updateUserByAdmin = async (req, res, next) => {
    const { email, phone } = req.body;
    const { userId } = req.params;

    try {
        let errors = [];
        const emailError = validateEmail(email);
        const phoneError = validatePhone(phone);
        const duplicateEmailError = await checkDuplicateEmail(email, userId);
        const duplicatePhoneError = await checkDuplicatePhone(phone, userId);

        if (emailError) errors.push(emailError);
        if (phoneError) errors.push(phoneError);
        if (duplicateEmailError) errors.push(duplicateEmailError);
        if (duplicatePhoneError) errors.push(duplicatePhoneError);

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message }); // Use return for clarity
    }
};

// Middleware to validate change password input fields
exports.changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    try {
        // Check if both current and new passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }

        // Validate the strength of the new password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({ success: false, passwordError });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await user.isPasswordMatch(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message }); // Use return for clarity
    }
};

// Middleware to validate forgot password input fields
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ success: false, emailError });
        }

        const user = await User.findOne({ email }).lean();
        if (!user) return res.status(404).json({ success: false, message: 'There is no user with email address.' });
        if (!user.isActive) return res.status(403).json({ success: false, message: 'Account was deactivated' });
        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message });
    }
};

exports.resetPassword = async (req, res, next) => {
    const { password } = req.body;

    try {
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, passwordError });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, errorAt: req.originalUrl, message: error.message });
    }
}
