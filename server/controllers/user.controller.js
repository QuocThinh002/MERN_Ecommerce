const User = require('../models/user.model');


// [POST] /users/signup 
exports.signup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;

        await User.create({ fullName, email, phone, password });

        res.status(201).json({ success: true, message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /users/me
exports.getUser = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log(req.user)
        const user = await User.findById(userId).lean().select('-refreshToken -password -role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [GET] /users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean().select('-refreshToken -password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// [GET] /users/:userId 
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).lean().select("-password -refreshToken");
        if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// [PATCH] /users/me
exports.updateMe = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true }).select('-refreshToken -password -role');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, message: "update successfull" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [PATCH] /users/:userId 
exports.updateUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.body.role == process.env.ADMIN_ROLE) return res.status(403).json({ success: false, message: "cannot update admin other" });
        const user = await User.findByIdAndUpdate(userId, req.body, { new: true }).select('-refreshToken -password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found!' });

        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// [PACTH] /users/changePassword
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { userId } = req.user;

        await User.findByIdAndUpdate(userId, { password: newPassword, passwordChangedAt: Date.now() });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.deactivateUser = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found!' });
        user.refreshToken = undefined;
        user.save();

        res.status(200).json({ success: true, message: 'Account deactivated successfully' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


