const mongoose = require('mongoose')

const Comment = mongoose.model('Comment', {
    content: {
        type: String,
        required: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    architectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Architect',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = Comment;
