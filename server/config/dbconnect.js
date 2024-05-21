const mongoose = require('mongoose');

// 0: disconnected
// 1: connected
// 2: connecting
// 3: disconnecting
async function connectToDatabase() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        if (conn.connection.readyState === 1) {
            console.log('MongoDB database connection established successfully!');
        } else {
            console.warn('MongoDB connection in progress...');
        }
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

module.exports = connectToDatabase;
