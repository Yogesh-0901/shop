const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Update user profile details
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, phone } = req.body;

        if (!fullName) {
            return res.status(400).json({ error: "Full Name is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, phone },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

// Change password for logged in user
exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new passwords are required" });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ error: "New password must be at least 8 characters long and contain both letters and numbers" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect current password" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: "Failed to change password" });
    }
};
