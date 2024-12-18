const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class SocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.setupSocketAuth();
  }

  setupSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.user._id.toString();
    this.userSockets.set(userId, socket.id);

    // Update user status to online
    User.findByIdAndUpdate(userId, { status: 'online' }).exec();

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.userSockets.delete(userId);
      User.findByIdAndUpdate(userId, { status: 'offline' }).exec();
    });

    // Handle joining chat rooms
    socket.on('join_room', (roomId) => {
      socket.join(`chat:${roomId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave_room', (roomId) => {
      socket.leave(`chat:${roomId}`);
    });

    // Handle document collaboration
    socket.on('join_document', (documentId) => {
      socket.join(`document:${documentId}`);
    });

    socket.on('leave_document', (documentId) => {
      socket.leave(`document:${documentId}`);
    });

    // Handle document updates
    socket.on('document_update', (data) => {
      socket.to(`document:${data.documentId}`).emit('document_updated', {
        documentId: data.documentId,
        content: data.content,
        updatedBy: socket.user._id
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (roomId) => {
      socket.to(`chat:${roomId}`).emit('user_typing', {
        userId: socket.user._id,
        username: socket.user.username
      });
    });

    socket.on('typing_end', (roomId) => {
      socket.to(`chat:${roomId}`).emit('user_stopped_typing', {
        userId: socket.user._id
      });
    });
  }

  // Utility methods for emitting events
  emitToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToRoom(roomId, event, data) {
    this.io.to(`chat:${roomId}`).emit(event, data);
  }

  emitToDocument(documentId, event, data) {
    this.io.to(`document:${documentId}`).emit(event, data);
  }
}

module.exports = SocketService;
