const express = require('express');
const router = express.Router();
const Architect = require('../models/architect'); // Adjust path as needed
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original extension
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ARCHITECT REGISTRATION
router.post('/register', upload.single('image'), async (req, res) => {
  console.log('🔹 Architect registration request received');
  console.log('📋 Request body:', req.body);
  console.log('📁 Uploaded file:', req.file?.filename || 'No file');

  try {
    const { name, lastname, email, password, about } = req.body;

    // Validate required fields
    if (!name || !lastname || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Name, lastname, email, and password are required' 
      });
    }

    // Check if architect already exists
    const existingArchitect = await Architect.findOne({ email: email.toLowerCase() });
    if (existingArchitect) {
      console.log('❌ Architect already exists with email:', email);
      return res.status(400).json({ 
        message: 'An architect with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Create architect object
    const architectData = {
      name: name.trim(),
      lastname: lastname.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      about: about?.trim() || '',
      image: req.file ? req.file.filename : null
    };

    console.log('📝 Creating architect with data:', {
      ...architectData,
      password: '[HIDDEN]'
    });

    // Save to database
    const newArchitect = new Architect(architectData);
    const savedArchitect = await newArchitect.save();
    
    console.log('✅ Architect saved successfully with ID:', savedArchitect._id);

    // Generate JWT token (optional - or just return success)
    const token = jwt.sign(
      { 
        userId: savedArchitect._id,
        email: savedArchitect.email,
        name: savedArchitect.name,
        lastname: savedArchitect.lastname,
        userType: 'architect'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Return success response
    res.status(201).json({
      message: 'Architect registered successfully',
      token: token,
      architect: {
        id: savedArchitect._id,
        name: savedArchitect.name,
        lastname: savedArchitect.lastname,
        email: savedArchitect.email,
        about: savedArchitect.about,
        image: savedArchitect.image
      }
    });

  } catch (error) {
    console.error('💥 Architect registration error:', error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error: ' + error.message 
      });
    }
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ 
        message: 'An architect with this email already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
    });
  }
});

// ARCHITECT LOGIN
router.post('/login', async (req, res) => {
  console.log('🔹 Architect login request received');
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find architect
    const architect = await Architect.findOne({ email: email.toLowerCase() });
    if (!architect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, architect.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: architect._id,
        email: architect.email,
        name: architect.name,
        lastname: architect.lastname,
        userType: 'architect'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    console.log('✅ Architect login successful:', architect.email);

    res.json({
      message: 'Login successful',
      token: token,
      architect: {
        id: architect._id,
        name: architect.name,
        lastname: architect.lastname,
        email: architect.email,
        about: architect.about,
        image: architect.image
      }
    });

  } catch (error) {
    console.error('💥 Architect login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET ALL ARCHITECTS (for about page)
router.get('/', async (req, res) => {
  try {
    const architects = await Architect.find({}, '-password'); // Exclude password
    res.json(architects);
  } catch (error) {
    console.error('Error fetching architects:', error);
    res.status(500).json({ message: 'Failed to fetch architects' });
  }
});

// GET ARCHITECT BY ID
router.get('/:id', async (req, res) => {
  try {
    const architect = await Architect.findById(req.params.id, '-password');
    if (!architect) {
      return res.status(404).json({ message: 'Architect not found' });
    }
    res.json(architect);
  } catch (error) {
    console.error('Error fetching architect:', error);
    res.status(500).json({ message: 'Failed to fetch architect' });
  }
});

module.exports = router;