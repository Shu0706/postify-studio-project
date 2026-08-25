import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    {
      icon: <LightBulbIcon className="w-4 h-4" />,
      title: "Content Ideas",
      prompt: "Give me 5 creative social media post ideas for my business"
    },
    {
      icon: <SparklesIcon className="w-4 h-4" />,
      title: "Marketing Strategy",
      prompt: "What's a good marketing strategy for small businesses?"
    },
    {
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
      title: "Engagement Tips",
      prompt: "How can I improve engagement on my social media posts?"
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `Hi ${user?.name || 'there'}! 👋 I'm your Postify Studio AI assistant. I can help you with:
        
• Social media content ideas
• Marketing strategies
• SEO tips
• Business growth advice
• Creative campaign concepts

What would you like to explore today?`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageContent = input) => {
    if (!messageContent.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/ask', {
        message: messageContent,
        context: `User role: ${user?.role}`
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.data.response,
        timestamp: new Date().toISOString(),
        tokensUsed: response.data.data.tokensUsed
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = async (serviceType) => {
    try {
      setIsLoading(true);
      const response = await api.post('/ai/suggestions', {
        serviceType,
        tone: 'professional'
      });

      const suggestionMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.data.data.suggestions,
        timestamp: new Date().toISOString(),
        isSpecial: true
      };

      setMessages(prev => [...prev, suggestionMessage]);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageContent = (content) => {
    // Convert numbered lists to proper formatting
    return content.split('\n').map((line, index) => {
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="mb-2">
            <span className="font-medium text-blue-600">{line.split('.')[0]}.</span>
            <span className="ml-2">{line.substring(line.indexOf('.') + 1)}</span>
          </div>
        );
      }
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <div key={index} className="mb-1 ml-4">
            <span className="text-blue-500 mr-2">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        );
      }
      return line && <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
      >
        <SparklesIcon className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
              }`}>
                {message.type === 'ai' ? (
                  <div className="text-sm leading-relaxed">
                    {formatMessageContent(message.content)}
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                {message.type === 'error' && (
                  <div className="flex items-center mt-2 text-xs text-red-600">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    Error occurred
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {message.tokensUsed && (
                    <span className="ml-2">• {message.tokensUsed} tokens</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick suggestions */}
        {messages.length <= 1 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Quick suggestions:</p>
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => sendMessage(prompt.prompt)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">{prompt.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{prompt.title}</p>
                    <p className="text-xs text-gray-500">{prompt.prompt}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about marketing, content, or business growth..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              style={{ minHeight: '36px', maxHeight: '100px' }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
        
        {user?.role === 'client' && (
          <div className="flex space-x-1 mt-2">
            {['social_media', 'content_creation', 'seo'].map((serviceType) => (
              <button
                key={serviceType}
                onClick={() => getSuggestions(serviceType)}
                disabled={isLoading}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {serviceType.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
