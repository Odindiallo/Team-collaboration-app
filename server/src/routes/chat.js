const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');

// Get chat messages for a room
router.get('/:room', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/', authenticate, async (req, res) => {
  try {
    const { room, content, type = 'text' } = req.body;
    
    const message = new Message({
      sender: req.user._id,
      room,
      content,
      type
    });

    await message.save();
    
    // Populate sender info before sending response
    await message.populate('sender', 'username avatar');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/read/:room', authenticate, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        room: req.params.room,
        readBy: { $ne: req.user._id }
      },
      { 
        $addToSet: { readBy: req.user._id }
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
