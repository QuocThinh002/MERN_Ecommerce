const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        validate: {
            validator: function (value) {
                return /^(0|\+84)[3|5|7|8|9]\d{8}$/.test(value);
            },
            message: 'Please provide a valid phone number',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                });
            },
            message: 'Password must be strong (at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol)',
        },
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'Invalid role. Must be either "user" or "admin"',
        },
        default: 'user',
    },
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
            color: { type: String, trim: true },
            size: { type: String, trim: true },
        }
    ],
    addresses: [
        {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            zip: { type: String, trim: true },
            country: { type: String, trim: true },
        }
    ],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    refreshToken: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

// Indexing for scalability
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isActive: 1 });

// Middleware before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password is modified

    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
});

// Middleware before updating
userSchema.pre('findOneAndUpdate', async function (next) {
    if (!this._update.password) return next(); // Only hash if password is being updated

    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    this._update.password = await bcrypt.hash(this._update.password, salt); // Hash the new password
    next();
});

// Method to check password
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

// Method to update passwordChangedAt
userSchema.methods.updatePasswordChangedAt = function () {
    this.passwordChangedAt = new Date();
};

module.exports = mongoose.model('User', userSchema);
