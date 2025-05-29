const mongoose = require('mongoose');

const architectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  lastname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  about: {
    type: String,
    trim: true,
    maxlength: [1000, 'About section cannot exceed 1000 characters'],
    default: ''
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'architects' // Explicitly set collection name
});

// Create indexes for better performance (email index is automatic due to unique: true)
architectSchema.index({ name: 1, lastname: 1 });

// Virtual for full name
architectSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastname}`;
});

// Transform JSON output (remove password, format response)
architectSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Architect', architectSchema);