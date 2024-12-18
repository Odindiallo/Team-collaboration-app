const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Document = require('../models/Document');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get counts from all collections in parallel
        const [teamMembers, activeTasks, documents, unreadMessages] = await Promise.all([
            // Count active team members (excluding the current user)
            User.countDocuments({ _id: { $ne: userId }, active: true }),
            
            // Count tasks assigned to the user that are active
            Task.countDocuments({ 
                assignedTo: userId,
                status: { $in: ['todo', 'in-progress'] }
            }),
            
            // Count documents shared with or created by the user
            Document.countDocuments({
                $or: [
                    { owner: userId },
                    { sharedWith: userId }
                ]
            }),
            
            // Count unread messages for the user
            Message.countDocuments({
                to: userId,
                read: false
            })
        ]);

        res.json({
            teamMembers,
            activeTasks,
            documents,
            unreadMessages
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// GET /api/dashboard/activity
router.get('/activity', auth.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const activities = [];

        // Get recent tasks
        const tasks = await Task.find({
            assignedTo: userId,
            status: { $in: ['todo', 'in-progress'] }
        })
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate('assignedBy', 'username')
        .lean();

        tasks.forEach(task => {
            activities.push({
                _id: task._id,
                type: 'task',
                message: `Task "${task.title}" ${task.status === 'todo' ? 'assigned' : 'in progress'}`,
                createdAt: task.updatedAt
            });
        });

        // Get recent documents
        const docs = await Document.find({
            $or: [
                { owner: userId },
                { sharedWith: userId }
            ]
        })
        .sort({ updatedAt: -1 })
        .limit(3)
        .populate('owner', 'username')
        .lean();

        docs.forEach(doc => {
            activities.push({
                _id: doc._id,
                type: 'document',
                message: `Document "${doc.title}" ${doc.owner._id === userId ? 'updated' : 'shared with you'}`,
                createdAt: doc.updatedAt
            });
        });

        // Get recent unread messages
        const messages = await Message.find({
            to: userId,
            read: false
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('from', 'username')
        .lean();

        messages.forEach(msg => {
            activities.push({
                _id: msg._id,
                type: 'chat',
                message: `New message from ${msg.from.username}`,
                createdAt: msg.createdAt
            });
        });

        // Sort all activities by date and return most recent
        activities.sort((a, b) => b.createdAt - a.createdAt);
        res.json(activities.slice(0, 5));

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ message: 'Error fetching recent activity' });
    }
});

module.exports = router;
