import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // Simulate fetching notifications
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          title: 'Project Status Update',
          message: 'Your website redesign project has moved to the "In Review" stage. Please check the deliverables and provide feedback.',
          date: '2025-06-30T14:30:00',
          type: 'project',
          read: false
        },
        {
          id: 2,
          title: 'New Message',
          message: 'You have a new message from Sarah Johnson regarding your social media campaign.',
          date: '2025-06-30T10:15:00',
          type: 'message',
          read: false
        },
        {
          id: 3,
          title: 'File Uploaded',
          message: 'A new file "Website_Mockup_Final.pdf" has been uploaded to your account.',
          date: '2025-06-29T16:45:00',
          type: 'file',
          read: true
        },
        {
          id: 4,
          title: 'Invoice Generated',
          message: 'Invoice #INV-2025-0142 has been generated for your social media campaign project. Payment is due by July 15, 2025.',
          date: '2025-06-29T11:30:00',
          type: 'billing',
          read: false
        },
        {
          id: 5,
          title: 'Project Completed',
          message: 'Your logo design project has been marked as completed. Please provide final approval.',
          date: '2025-06-28T15:20:00',
          type: 'project',
          read: true
        },
        {
          id: 6,
          title: 'Feedback Requested',
          message: 'Michael Chen has requested your feedback on the latest content draft for your blog article series.',
          date: '2025-06-28T09:45:00',
          type: 'project',
          read: true
        },
        {
          id: 7,
          title: 'Meeting Scheduled',
          message: 'A strategy meeting has been scheduled for July 2, 2025 at 10:00 AM to discuss your Q3 marketing plan.',
          date: '2025-06-27T14:10:00',
          type: 'meeting',
          read: true
        },
        {
          id: 8,
          title: 'Service Recommendation',
          message: 'Based on your current projects, we recommend our SEO optimization service to improve your website visibility.',
          date: '2025-06-27T11:30:00',
          type: 'system',
          read: true
        },
        {
          id: 9,
          title: 'Payment Confirmation',
          message: 'Your payment of $1,200 for Invoice #INV-2025-0138 has been successfully processed. Thank you!',
          date: '2025-06-26T16:55:00',
          type: 'billing',
          read: true
        },
        {
          id: 10,
          title: 'New Feature Available',
          message: "We've added a new AI Assistant feature to help you get instant answers about your projects. Try it now!",
          date: '2025-06-26T09:15:00',
          type: 'system',
          read: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Today, show time only
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Older than yesterday
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-500 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-500 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'file':
        return (
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <svg className="h-6 w-6 text-purple-500 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'billing':
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-500 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'meeting':
        return (
          <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <svg className="h-6 w-6 text-yellow-500 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Stay updated with project notifications and messages.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="mt-4 md:mt-0 text-primary hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'unread'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('project')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'project'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setFilter('message')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'message'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setFilter('billing')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'billing'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setFilter('file')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'file'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">No notifications found. Try changing your filters.</p>
        </div>
      ) : (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredNotifications.map((notification) => (
            <motion.div 
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                !notification.read ? 'border-l-4 border-primary' : ''
              }`}
              variants={itemVariants}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className={`text-base font-medium ${
                      !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                  <p className={`mt-1 ${
                    !notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="mt-3 flex justify-end">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-primary hover:text-blue-700 text-sm font-medium mr-4"
                      >
                        Mark as read
                      </button>
                    )}
                    <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ClientNotifications;
