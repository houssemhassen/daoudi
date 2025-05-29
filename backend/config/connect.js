require('dotenv').config();
const mongoose = require('mongoose');

// Use environment variable if available, otherwise use default connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easyarchi';

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB at', MONGODB_URI);
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('💡 Make sure MongoDB is running and accessible');
    process.exit(1); // Exit if can't connect to database
});

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('📦 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📦 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed through app termination');
    process.exit(0);
});

module.exports = mongoose;