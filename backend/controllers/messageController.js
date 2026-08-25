const { Message, User } = require('../models');
const { formatResponse } = require('../utils/helpers');
const { AppError } = require('../middlewares/errorHandler');

class MessageController {
  // Get chat conversations for a user
  async getConversations(req, res, next) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      // Get all conversations where user is either sender or receiver
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { senderId: userId },
              { receiverId: userId }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$senderId', userId] },
                '$receiverId',
                '$senderId'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiverId', userId] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'otherUser'
          }
        },
        {
          $unwind: '$otherUser'
        },
        {
          $project: {
            _id: 1,
            otherUser: {
              _id: 1,
              name: 1,
              email: 1,
              role: 1,
              avatar: 1
            },
            lastMessage: {
              _id: 1,
              content: 1,
              messageType: 1,
              createdAt: 1,
              isRead: 1
            },
            unreadCount: 1
          }
        },
        {
          $sort: { 'lastMessage.createdAt': -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: parseInt(limit)
        }
      ]);

      res.json(formatResponse({
        conversations,
        pagination: {
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      }, 'Conversations retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get messages between two users
  async getMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { otherUserId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate other user exists
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        throw new AppError('User not found', 404);
      }

      // Get messages between the two users
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('senderId', 'name avatar')
        .populate('receiverId', 'name avatar')
        .exec();

      // Mark messages as read (where current user is receiver)
      await Message.updateMany(
        {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Reverse to show oldest first
      messages.reverse();

      const total = await Message.countDocuments({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      });

      res.json(formatResponse({
        messages,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          avatar: otherUser.avatar
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Messages retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Send a message
  async sendMessage(req, res, next) {
    try {
      const senderId = req.user._id;
      const { receiverId, content, messageType = 'text', attachments } = req.body;

      // Validate receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        throw new AppError('Receiver not found', 404);
      }

      // Create message
      const message = new Message({
        senderId,
        receiverId,
        content,
        messageType,
        attachments: attachments || []
      });

      await message.save();

      // Populate sender and receiver info
      const populatedMessage = await Message.findById(message._id)
        .populate('senderId', 'name avatar')
        .populate('receiverId', 'name avatar');

      // Emit socket event for real-time chat (if socket is available)
      if (req.io) {
        req.io.to(`user_${receiverId}`).emit('newMessage', populatedMessage);
      }

      res.status(201).json(formatResponse(populatedMessage, 'Message sent successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Mark message as read
  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;

      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          receiverId: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!message) {
        throw new AppError('Message not found or already read', 404);
      }

      res.json(formatResponse(message, 'Message marked as read'));
    } catch (error) {
      next(error);
    }
  }

  // Mark all messages in a conversation as read
  async markConversationAsRead(req, res, next) {
    try {
      const { otherUserId } = req.params;
      const userId = req.user._id;

      const result = await Message.updateMany(
        {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      res.json(formatResponse({
        modifiedCount: result.modifiedCount
      }, 'Conversation marked as read'));
    } catch (error) {
      next(error);
    }
  }

  // Delete a message
  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user._id;

      const message = await Message.findOneAndDelete({
        _id: messageId,
        senderId: userId
      });

      if (!message) {
        throw new AppError('Message not found or you can only delete your own messages', 404);
      }

      res.json(formatResponse(null, 'Message deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get unread message count
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user._id;

      const unreadCount = await Message.countDocuments({
        receiverId: userId,
        isRead: false
      });

      res.json(formatResponse({ unreadCount }, 'Unread count retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Search messages
  async searchMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { query, otherUserId, page = 1, limit = 20 } = req.query;

      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const searchFilter = {
        $and: [
          {
            $or: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          {
            content: { $regex: query, $options: 'i' }
          }
        ]
      };

      // If otherUserId is provided, search only in that conversation
      if (otherUserId) {
        searchFilter.$and.push({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        });
      }

      const messages = await Message.find(searchFilter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('senderId', 'name avatar')
        .populate('receiverId', 'name avatar')
        .exec();

      const total = await Message.countDocuments(searchFilter);

      res.json(formatResponse({
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }, 'Messages search completed'));
    } catch (error) {
      next(error);
    }
  }

  // Get chat statistics (admin only)
  async getChatStats(req, res, next) {
    try {
      const totalMessages = await Message.countDocuments();
      const totalConversations = await Message.distinct('receiverId').then(receivers => 
        Message.distinct('senderId').then(senders => 
          new Set([...receivers, ...senders]).size
        )
      );

      const messagesByType = await Message.aggregate([
        {
          $group: {
            _id: '$messageType',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentMessages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email');

      const stats = {
        totalMessages,
        totalConversations,
        messagesByType,
        recentMessages
      };

      res.json(formatResponse(stats, 'Chat statistics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
