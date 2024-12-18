const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  fileUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ to: 1, read: 1 });
messageSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('Message', messageSchema);
