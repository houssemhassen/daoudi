require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import database connection first
require('./config/connect');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));
app.use('/getimage', express.static(uploadsDir));

// Import routes after database connection
const articleApi = require('./routes/article');
const architectApi = require('./routes/architect');
const userApi = require('./routes/user');
const commentApi = require('./routes/comment');

// Use routes
app.use('/article', articleApi);
app.use('/architect', architectApi);
app.use('/user', userApi);
app.use('/comment', commentApi);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: 'Only image files are allowed' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Available at: http://localhost:${PORT}/`);
});