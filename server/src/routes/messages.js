const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

// Get messages for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      to: req.user.id,
      read: false
    })
    .populate('from', 'username')
    .sort('-createdAt')
    .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { to, content, type = 'text' } = req.body;

    const message = new Message({
      from: req.user.id,
      to,
      content,
      type
    });

    await message.save();
    
    await message.populate('from', 'username');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, to: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
