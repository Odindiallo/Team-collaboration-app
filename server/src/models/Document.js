const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'spreadsheet', 'presentation'],
    default: 'text'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  permissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    access: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  lastViewed: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for faster queries
documentSchema.index({ owner: 1 });
documentSchema.index({ sharedWith: 1 });
documentSchema.index({ 'permissions.user': 1 });
documentSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
