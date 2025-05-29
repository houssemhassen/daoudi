const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all comments for an article
router.get('/article/:articleId', async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.articleId })
            .populate('userId', 'name')
            .sort('-createdAt');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
});

// Add a new comment
router.post('/', verifyToken, async (req, res) => {
    try {
        const { content, articleId } = req.body;
        const comment = new Comment({
            content,
            articleId,
            userId: req.user.userId
        });
        
        await comment.save();
        const populatedComment = await Comment.findById(comment._id).populate('userId', 'name');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error: error.message });
    }
});

// Delete a comment (only owner can delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.remove();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
});

module.exports = router;
