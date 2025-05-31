const express = require('express');
const router = express.Router();
const Architect = require('../models/architect');
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedArchitect._id,
        id: savedArchitect._id, // Add this for compatibility
        email: savedArchitect.email,
        name: savedArchitect.name,
        lastname: savedArchitect.lastname,
        about: savedArchitect.about,
        userType: 'architect'
      },
      process.env.JWT_SECRET || '5773',
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
        id: architect._id, // Add this for compatibility
        email: architect.email,
        name: architect.name,
        lastname: architect.lastname,
        about: architect.about,
        userType: 'architect'
      },
      process.env.JWT_SECRET || '5773',
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

// GET ALL ARCHITECTS - IMPORTANT: This route must come BEFORE /:id route
router.get('/all', async (req, res) => {
  console.log('📋 Getting all architects...');
  try {
    const architects = await Architect.find({}, '-password'); // Exclude password
    console.log(`✅ Found ${architects.length} architects`);
    res.status(200).json(architects);
  } catch (error) {
    console.error('❌ Error fetching architects:', error);
    res.status(500).json({ message: 'Failed to fetch architects' });
  }
});

// UPDATE ARCHITECT PROFILE
router.put('/update/:id', upload.single('image'), async (req, res) => {
  console.log('🔹 Architect update request received for ID:', req.params.id);
  
  try {
    const { id } = req.params;
    const { name, lastname, email, about, password } = req.body;

    // Check if architect exists
    const architect = await Architect.findById(id);
    if (!architect) {
      return res.status(404).json({ message: 'Architect not found' });
    }

    // Check if email is already taken by another architect
    if (email && email !== architect.email) {
      const existingArchitect = await Architect.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingArchitect) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (lastname) updateData.lastname = lastname.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (about !== undefined) updateData.about = about.trim();

    // Handle image update if an image file is uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Handle password update if provided
    if (password && password.trim()) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Update architect data
    const updatedArchitect = await Architect.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, select: '-password' }
    );

    // Create new token with updated info
    const token = jwt.sign(
      {
        userId: updatedArchitect._id,
        id: updatedArchitect._id,
        email: updatedArchitect.email,
        name: updatedArchitect.name,
        lastname: updatedArchitect.lastname,
        about: updatedArchitect.about,
        userType: 'architect'
      },
      process.env.JWT_SECRET || '5773',
      { expiresIn: '30d' }
    );

    console.log('✅ Architect updated successfully');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      token,
      architect: {
        id: updatedArchitect._id,
        name: updatedArchitect.name,
        lastname: updatedArchitect.lastname,
        email: updatedArchitect.email,
        about: updatedArchitect.about,
        image: updatedArchitect.image
      }
    });
  } catch (error) {
    console.error('❌ Update architect error:', error);
    res.status(500).json({ 
      message: 'Error updating architect profile', 
      error: error.message 
    });
  }
});

// GET ARCHITECT BY ID - IMPORTANT: This route must come AFTER specific routes like /all
router.get('/getbyid/:id', async (req, res) => {
  console.log('👤 Getting architect by ID:', req.params.id);
  try {
    const architect = await Architect.findById(req.params.id, '-password');
    if (!architect) {
      console.log('❌ Architect not found');
      return res.status(404).json({ message: 'Architect not found' });
    }
    console.log('✅ Architect found:', architect.name);
    res.status(200).json(architect);
  } catch (error) {
    console.error('❌ Error fetching architect:', error);
    res.status(500).json({ message: 'Failed to fetch architect' });
  }
});

// DELETE ARCHITECT
router.delete('/supprimer/:id', async (req, res) => {
  console.log('🗑️ Deleting architect with ID:', req.params.id);
  try {
    const deletedArchitect = await Architect.findByIdAndDelete(req.params.id);
    if (!deletedArchitect) {
      return res.status(404).json({ message: 'Architect not found' });
    }
    console.log('✅ Architect deleted successfully');
    res.status(200).json({ message: 'Architect deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting architect:', error);
    res.status(500).json({ message: 'Failed to delete architect' });
  }
});

// SEED DATA FOR TESTING
router.post('/seed', async (req, res) => {
  console.log('🌱 Seeding architect data...');
  
  const architects = [
    {
      name: 'John',
      lastname: 'Smith',
      email: 'john.smith@architect.com',
      password: '$2b$10$8IAk6S0S.V6ujS9RHhY1R.XZ2kd3ERw33a9HG6y3A6yOBXpNnPbnO', // password: test123
      about: 'Innovative architect specializing in sustainable urban design with over 15 years of experience.',
      image: '1718065324484.jpeg'
    },
    {
      name: 'Emily',
      lastname: 'Jones',
      email: 'emily.jones@architect.com',
      password: '$2b$10$8IAk6S0S.V6ujS9RHhY1R.XZ2kd3ERw33a9HG6y3A6yOBXpNnPbnO',
      about: 'Award-winning architect focused on modern residential spaces and eco-friendly design solutions.',
      image: '1718068558189.jpeg'
    },
    {
      name: 'Thomas',
      lastname: 'Macaulay',
      email: 'thomas.m@architect.com',
      password: '$2b$10$8IAk6S0S.V6ujS9RHhY1R.XZ2kd3ERw33a9HG6y3A6yOBXpNnPbnO',
      about: 'Passionate about blending traditional architecture with contemporary needs, specializing in cultural spaces.',
      image: '1718102013093.jpeg'
    }
  ];

  try {
    await Architect.deleteMany({}); // Clear existing architects
    const savedArchitects = await Architect.insertMany(architects);
    console.log('✅ Seed data created successfully');
    res.status(200).json({
      message: 'Seed data created successfully',
      count: savedArchitects.length,
      architects: savedArchitects.map(a => ({
        id: a._id,
        name: a.name,
        lastname: a.lastname,
        email: a.email
      }))
    });
  } catch (error) {
    console.error('❌ Seed data creation failed:', error);
    res.status(500).json({ message: 'Failed to create seed data', error: error.message });
  }
});

// TEST ENDPOINTS FOR DIFFERENT SCENARIOS
router.get('/test/:scenario', async (req, res) => {
  const { scenario } = req.params;
  console.log('🧪 Test scenario requested:', scenario);
  
  switch(scenario) {
    case 'no-articles':
      // Return architect with no articles
      return res.json({
        _id: 'test-architect-1',
        name: 'Test',
        lastname: 'Architect',
        email: 'test@example.com',
        about: 'Test architect with no articles',
        image: 'nonexistent.jpg'
      });
      
    case 'invalid':
      // Simulate invalid architect ID
      return res.status(404).json({
        message: 'Architect not found'
      });
      
    case 'error':
      // Simulate server error
      return res.status(500).json({
        message: 'Internal server error'
      });
      
    default:
      return res.status(400).json({
        message: 'Invalid test scenario'
      });
  }
});

// GET ARCHITECT BY ID (Alternative route for compatibility)
router.get('/:id', async (req, res) => {
  console.log('👤 Getting architect by ID (alternative route):', req.params.id);
  try {
    const architect = await Architect.findById(req.params.id, '-password');
    if (!architect) {
      console.log('❌ Architect not found');
      return res.status(404).json({ message: 'Architect not found' });
    }
    console.log('✅ Architect found:', architect.name);
    res.status(200).json(architect);
  } catch (error) {
    console.error('❌ Error fetching architect:', error);
    
    // Handle ObjectId casting errors specifically
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid architect ID format' 
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch architect' });
  }
});

module.exports = router;