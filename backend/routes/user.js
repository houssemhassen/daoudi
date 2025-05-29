const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// USER REGISTRATION
router.post('/register', async (req, res) => {
  console.log('🔹 User registration request received');
  console.log('📋 Request body:', req.body);

  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists with email:', email);
      return res.status(400).json({ 
        message: 'A user with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    };

    console.log('📝 Creating user with data:', {
      ...userData,
      password: '[HIDDEN]'
    });

    // Save to database
    const newUser = new User(userData);
    const savedUser = await newUser.save();
    
    console.log('✅ User saved successfully with ID:', savedUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        userType: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });

  } catch (error) {
    console.error('💥 User registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error: ' + error.message 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A user with this email already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
    });
  }
});

// USER LOGIN
router.post('/login', async (req, res) => {
  console.log('🔹 User login request received');
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        name: user.name,
        userType: 'user'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('✅ User login successful:', user.email);

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('💥 User login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;