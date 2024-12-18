const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Document = require('../models/Document');

// Get all documents user has access to
router.get('/', authenticate, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { owner: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    })
    .populate('owner', 'username')
    .populate('sharedWith.user', 'username')
    .sort({ updatedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new document
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    const document = new Document({
      title,
      content,
      type,
      owner: req.user._id,
      versions: [{
        content,
        updatedBy: req.user._id
      }]
    });

    await document.save();
    await document.populate('owner', 'username');
    
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has edit permission
    if (document.owner.toString() !== req.user._id.toString() &&
        !document.sharedWith.some(share => 
          share.user.toString() === req.user._id.toString() && 
          ['edit', 'admin'].includes(share.permission)
        )) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    document.content = content;
    document.version += 1;
    document.versions.push({
      content,
      updatedBy: req.user._id
    });

    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Share document
router.post('/:id/share', authenticate, async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner or admin
    if (document.owner.toString() !== req.user._id.toString() &&
        !document.sharedWith.some(share => 
          share.user.toString() === req.user._id.toString() && 
          share.permission === 'admin'
        )) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update or add share permission
    const shareIndex = document.sharedWith.findIndex(
      share => share.user.toString() === userId
    );

    if (shareIndex > -1) {
      document.sharedWith[shareIndex].permission = permission;
    } else {
      document.sharedWith.push({ user: userId, permission });
    }

    await document.save();
    await document.populate('sharedWith.user', 'username');
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to document
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to the document
    if (document.owner.toString() !== req.user._id.toString() &&
        !document.sharedWith.some(share => 
          share.user.toString() === req.user._id.toString()
        )) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    document.comments.push({
      user: req.user._id,
      content
    });

    await document.save();
    await document.populate('comments.user', 'username');
    
    res.status(201).json(document.comments[document.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
