const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite default port
      "http://localhost:3000"  // React default port
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:5173", // Vite default port
    "http://localhost:3000"  // React default port
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Socket.IO connection handling
const activeUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const jwt = require('jsonwebtoken');
    const { User, Employee, Admin } = require('./models');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user based on role
    let user;
    switch (decoded.role) {
      case 'client':
        user = await User.findById(decoded.id).select('-password');
        break;
      case 'employee':
        user = await Employee.findById(decoded.id).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-password');
        break;
      default:
        return next(new Error('Authentication error: Invalid token role'));
    }

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (!user.isActive) {
      return next(new Error('Authentication error: Account is deactivated'));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: ' + error.message));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId, 'Role:', socket.userRole);

  // Automatically join user's personal room
  socket.join(`user_${socket.userId}`);
  activeUsers.set(socket.userId, socket.id);
  console.log(`User ${socket.userId} joined personal room`);

  // Join role-based rooms
  if (socket.userRole === 'admin') {
    socket.join('admin_room');
    console.log(`Admin ${socket.userId} joined admin room`);
  } else if (socket.userRole === 'employee') {
    socket.join('employee_room');
    console.log(`Employee ${socket.userId} joined employee room`);
  } else if (socket.userRole === 'client') {
    socket.join('client_room');
    console.log(`Client ${socket.userId} joined client room`);
  }
  
  // Broadcast user online status to their contacts
  socket.broadcast.emit('user-online', socket.userId);

  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { Message } = require('./models');
      
      // Create message in database
      const message = new Message({
        conversationId: data.conversationId,
        sender: data.senderId,
        senderModel: data.senderModel,
        recipient: data.recipientId,
        recipientModel: data.recipientModel,
        content: data.content,
        messageType: data.messageType || 'text'
      });

      await message.save();

      // Populate sender info
      await message.populate('sender', 'name email avatar');

      // Emit to conversation room
      io.to(`conversation_${data.conversationId}`).emit('receive-message', {
        _id: message._id,
        conversationId: message.conversationId,
        sender: message.sender,
        senderModel: message.senderModel,
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt
      });

      // Emit notification to recipient's personal room
      io.to(`user_${data.recipientId}`).emit('new-message-notification', {
        messageId: message._id,
        senderId: data.senderId,
        senderName: message.sender.name,
        conversationId: data.conversationId,
        content: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
        timestamp: message.createdAt
      });

    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Typing indicators
  socket.on('typing-start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user-stopped-typing', {
      userId: data.userId
    });
  });

  // Mark messages as read
  socket.on('mark-messages-read', async (data) => {
    try {
      const { Message } = require('./models');
      
      await Message.updateMany(
        {
          conversationId: data.conversationId,
          recipient: data.userId,
          status: { $ne: 'read' }
        },
        {
          status: 'read',
          'readBy.0.readAt': new Date()
        }
      );

      // Notify sender that messages were read
      io.to(`conversation_${data.conversationId}`).emit('messages-read', {
        conversationId: data.conversationId,
        readBy: data.userId,
        readAt: new Date()
      });

    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        // Broadcast user offline status
        socket.broadcast.emit('user-offline', userId);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Postify Studio Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: 'API route not found'
      });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // 404 handler for development (API routes only)
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
