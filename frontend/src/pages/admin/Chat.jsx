import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { messageService } from '../../services/messageService';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeConversation) {
      scrollToBottom();
    }
  }, [messages, activeConversation]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter conversations based on search and filter
  useEffect(() => {
    let result = [...conversations];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(conv => {
        if (filter === 'unread') return conv.unreadCount > 0;
        if (filter === 'read') return conv.unreadCount === 0;
        return true;
      });
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      result = result.filter(conv => 
        conv.otherUser?.name?.toLowerCase().includes(searchTerm) ||
        conv.otherUser?.email?.toLowerCase().includes(searchTerm) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredConversations(result);
  }, [conversations, search, filter]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const response = await messageService.getMessages(otherUserId);
      setMessages(response.messages || []);
      // Mark conversation as read
      await markConversationAsRead(otherUserId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages.');
    }
  };

  const markConversationAsRead = async (otherUserId) => {
    try {
      await messageService.markConversationAsRead(otherUserId);
      // Update conversations to reflect read status
      setConversations(prev => prev.map(conv => 
        conv.otherUser._id === otherUserId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  const handleConversationClick = async (conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.otherUser._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    try {
      const newMessage = await messageService.sendMessage(
        activeConversation.otherUser._id, 
        messageText.trim()
      );

      // Add message to current messages
      setMessages(prev => [...prev, newMessage.message]);
      
      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.otherUser._id === activeConversation.otherUser._id
          ? { ...conv, lastMessage: newMessage.message, updatedAt: new Date() }
          : conv
      ));

      setMessageText('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-6rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full">
        {/* Conversations sidebar */}
        <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversations</h2>
            
            {/* Search and filters */}
            <div className="space-y-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === 'read'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Read
                </button>
              </div>
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-1 p-2"
            >
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {search || filter !== 'all' ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.otherUser._id}
                    variants={itemVariants}
                    onClick={() => handleConversationClick(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      activeConversation?.otherUser._id === conversation.otherUser._id
                        ? 'bg-primary/10 border border-primary/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
                          {conversation.otherUser.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.otherUser.name || 'Unknown User'}
                          </h3>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatTime(conversation.lastMessage?.createdAt)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {conversation.otherUser.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold">
                    {activeConversation.otherUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activeConversation.otherUser.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activeConversation.otherUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                    No messages in this conversation yet.
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isFromCurrentUser = message.sender._id !== activeConversation.otherUser._id;
                    const showDate = index === 0 || formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isFromCurrentUser
                              ? 'bg-primary text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isFromCurrentUser ? 'text-primary-light' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
