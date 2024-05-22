const User = require('../models/user.model');

async function deleteInactiveUsers() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30) // * 24 * 60 * 60 * 1000); // 30 days ago
        const deletedUsers = await User.deleteMany({
            isActive: false,
            updatedAt: { $lt: thirtyDaysAgo },
        });

        console.log(`Deleted ${deletedUsers.deletedCount} inactive users.`);
    } catch (error) {
        console.error('Error deleting inactive users:', error);
    }
}

module.exports = deleteInactiveUsers;