const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Article = require('../models/article'); // Make sure this path is correct
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Create Article
router.post('/ajout', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Creating article...');
    const { title, content, tags, description, idArchitect } = req.body;

    if (!title || !content || !description || !idArchitect || !req.file) {
      return res.status(400).json({ message: 'Missing required fields or image' });
    }

    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    const newArticle = new Article({
      title: title.trim(),
      content: content.trim(),
      description: description.trim(),
      idArchitect: idArchitect,
      image: req.file.filename,
      tags: tagsArray,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedArticle = await newArticle.save();
    console.log('✅ Article created successfully');
    
    res.status(201).json({
      message: 'Article created successfully',
      article: savedArticle
    });

  } catch (error) {
    console.error('❌ Article creation error:', error);
    res.status(500).json({ message: 'Server error during article creation' });
  }
});

// Get All Articles
router.get('/all', async (req, res) => {
  try {
    console.log('📚 Getting all articles...');
    const articles = await Article.find().sort({ date: -1 });
    console.log(`✅ Found ${articles.length} articles`);
    res.json(articles);
  } catch (error) {
    console.error('❌ Error getting articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Article by ID
router.get('/getbyid/:id', async (req, res) => {
  try {
    console.log('📄 Getting article by ID:', req.params.id);
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    console.log('✅ Article found');
    res.json(article);
  } catch (error) {
    console.error('❌ Error getting article:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Articles by Architect ID
router.get('/getbyidarchitect/:id', async (req, res) => {
  try {
    console.log('👤 Getting articles by architect ID:', req.params.id);
    const articles = await Article.find({ idArchitect: req.params.id }).sort({ date: -1 });
    console.log(`✅ Found ${articles.length} articles for architect`);
    res.json(articles);
  } catch (error) {
    console.error('❌ Error getting articles by architect:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search Articles
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    console.log('🔍 Searching articles with query:', query);
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const articles = await Article.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    }).sort({ date: -1 });

    console.log(`✅ Found ${articles.length} articles matching query`);
    res.json(articles);
  } catch (error) {
    console.error('❌ Error searching articles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;