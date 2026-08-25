import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import socketManager from '../../utils/socketManager';
import api from '../../services/api';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  PaperClipIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize socket connection and load conversations
  useEffect(() => {
    if (user) {
      socketManager.connect(user);
      loadConversations();
      setupSocketListeners();
    }

    return () => {
      socketManager.off('newMessage', handleNewMessage);
      socketManager.off('newMessageNotification', handleMessageNotification);
      socketManager.off('userTyping', handleUserTyping);
      socketManager.off('userStoppedTyping', handleUserStoppedTyping);
      socketManager.off('userOnline', handleUserOnline);
      socketManager.off('userOffline', handleUserOffline);
    };
  }, [user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupSocketListeners = () => {
    socketManager.on('newMessage', handleNewMessage);
    socketManager.on('newMessageNotification', handleMessageNotification);
    socketManager.on('userTyping', handleUserTyping);
    socketManager.on('userStoppedTyping', handleUserStoppedTyping);
    socketManager.on('userOnline', handleUserOnline);
    socketManager.on('userOffline', handleUserOffline);
  };

  const handleNewMessage = (message) => {
    if (activeConversation && message.conversationId === activeConversation.id) {
      setMessages(prev => [...prev, message]);
      // Mark as read if conversation is active
      socketManager.markMessagesAsRead(message.conversationId);
    }
    updateConversationLastMessage(message);
  };

  const handleMessageNotification = (notification) => {
    // Show notification for messages not in current conversation
    if (!activeConversation || notification.conversationId !== activeConversation.id) {
      // You can integrate with a toast notification library here
      console.log('New message notification:', notification);
    }
  };

  const handleUserTyping = (data) => {
    if (activeConversation && data.userId !== user.id) {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    }
  };

  const handleUserStoppedTyping = (data) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => new Set([...prev, userId]));
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/messages/conversation/${conversationId}`);
      setMessages(response.data.data || []);
      
      // Join the conversation room
      socketManager.joinConversation(conversationId);
      
      // Mark messages as read
      socketManager.markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation.id);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation.id,
      recipientId: activeConversation.participant.id,
      recipientModel: getRecipientModel(activeConversation.participant.role),
      content: messageInput.trim(),
      messageType: 'text'
    };

    // Add message to local state immediately for better UX
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      ...messageData,
      sender: { _id: user.id, name: user.name },
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageInput('');
    
    // Stop typing indicator
    if (isTyping) {
      socketManager.stopTyping(activeConversation.id);
      setIsTyping(false);
    }

    // Send via socket
    socketManager.sendMessage(messageData);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Handle typing indicators
    if (!isTyping && activeConversation) {
      setIsTyping(true);
      socketManager.startTyping(activeConversation.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && activeConversation) {
        setIsTyping(false);
        socketManager.stopTyping(activeConversation.id);
      }
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRecipientModel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'employee': return 'Employee';
      case 'client': return 'User';
      default: return 'User';
    }
  };

  const updateConversationLastMessage = (message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversationId
        ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
        : conv
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 rounded-full animate-spin border-t-transparent" />;
      case 'sent':
        return <CheckIcon className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircleIcon className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCircleIcon className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                  activeConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {conversation.participant.avatar ? (
                      <img
                        src={conversation.participant.avatar}
                        alt={conversation.participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    {onlineUsers.has(conversation.participant.id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participant.name}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {conversation.participant.role}
                    </p>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {activeConversation.participant.avatar ? (
                    <img
                      src={activeConversation.participant.avatar}
                      alt={activeConversation.participant.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  )}
                  {onlineUsers.has(activeConversation.participant.id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {activeConversation.participant.name}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize">
                    {onlineUsers.has(activeConversation.participant.id) ? 'Online' : 'Offline'} • {activeConversation.participant.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {isLoading && messages.length === 0 ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {message.sender._id === user.id && (
                            <div className="ml-2">
                              {getMessageStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-gray-500 px-4 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">
                        {typingUsers.map(u => u.userName).join(', ')} typing
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
