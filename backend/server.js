require('dotenv').config();
const express = require('express');
const articleApi = require('./routes/article');
const architectApi = require('./routes/architect');
const userApi = require('./routes/user');
const commentApi = require('./routes/comment');
const cors = require('cors');
require('./config/connect');

const app = express();

// CORS configuration - IMPORTANT: Must be specific for development
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// ROOT ENDPOINT - Frontend needs this to test connection
app.get('/', (req, res) => {
  res.json({ 
    message: 'EasyArchi Backend Server is running!',
    status: 'connected',
    timestamp: new Date().toISOString(),
    endpoints: {
      users: '/user',
      architects: '/architect', 
      articles: '/article',
      comments: '/comment'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/article', articleApi);
app.use('/architect', architectApi);
app.use('/user', userApi);
app.use('/comment', commentApi);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Endpoint ${req.originalUrl} not found`,
    availableEndpoints: ['/user', '/architect', '/article', '/comment']
  });
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Available at: http://localhost:${PORT}/`);
});