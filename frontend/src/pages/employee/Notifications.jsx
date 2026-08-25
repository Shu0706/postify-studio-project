import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EmployeeNotifications = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // Simulate fetching notifications
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      const mockNotifications = [
        {
          id: 1,
          type: 'task',
          title: 'New Task Assigned',
          message: 'You have been assigned a new task: "Design homepage mockup for TechSolutions"',
          from: 'Sarah Johnson',
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'message',
          title: 'New Message',
          message: 'Sarah Johnson sent you a message regarding the TechSolutions project',
          from: 'Sarah Johnson',
          time: '3 hours ago',
          read: false
        },
        {
          id: 3,
          type: 'system',
          title: 'System Maintenance',
          message: 'The system will be undergoing maintenance tonight from 2AM to 4AM EST',
          from: 'System',
          time: '5 hours ago',
          read: true
        },
        {
          id: 4,
          type: 'task',
          title: 'Task Updated',
          message: 'Task "Develop social media strategy for FashionHub" has been updated with new requirements',
          from: 'Michael Chen',
          time: '1 day ago',
          read: true
        },
        {
          id: 5,
          type: 'message',
          title: 'New Message',
          message: 'Jessica Williams replied to your comment on the SkyTravel logo design',
          from: 'Jessica Williams',
          time: '1 day ago',
          read: true
        },
        {
          id: 6,
          type: 'reminder',
          title: 'Task Due Tomorrow',
          message: 'Reminder: Task "Revise logo design for SkyTravel" is due tomorrow',
          from: 'System',
          time: '1 day ago',
          read: true
        },
        {
          id: 7,
          type: 'system',
          title: 'New Feature Available',
          message: 'Check out the new AI assistant feature available in your dashboard',
          from: 'System',
          time: '2 days ago',
          read: true
        },
        {
          id: 8,
          type: 'task',
          title: 'Task Feedback',
          message: 'Sarah Johnson left feedback on your task "Create Instagram ad visuals for SportyGear"',
          from: 'Sarah Johnson',
          time: '3 days ago',
          read: true
        },
        {
          id: 9,
          type: 'announcement',
          title: 'Company Meeting',
          message: 'Monthly company meeting scheduled for July 5th at 10AM EST',
          from: 'Admin',
          time: '3 days ago',
          read: true
        },
        {
          id: 10,
          type: 'announcement',
          title: 'New Client Onboarded',
          message: 'Welcome our new client, HealthFirst Clinic, to the Postify Studio family',
          from: 'Admin',
          time: '4 days ago',
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Get the icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'reminder':
        return (
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'announcement':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Notifications
        </h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-primary bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setFilter('all')}
            className={`mr-4 py-3 px-1 text-sm font-medium border-b-2 ${
              filter === 'all'
                ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`mr-4 py-3 px-1 text-sm font-medium border-b-2 ${
              filter === 'unread'
                ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('task')}
            className={`mr-4 py-3 px-1 text-sm font-medium border-b-2 ${
              filter === 'task'
                ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilter('message')}
            className={`mr-4 py-3 px-1 text-sm font-medium border-b-2 ${
              filter === 'message'
                ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setFilter('system')}
            className={`mr-4 py-3 px-1 text-sm font-medium border-b-2 ${
              filter === 'system'
                ? 'border-primary text-primary dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">No notifications found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <motion.li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {notification.time}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      From: {notification.from}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="ml-3 flex-shrink-0">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications;
