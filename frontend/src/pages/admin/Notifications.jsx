import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, UserIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

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
  visible: { y: 0, opacity: 1 }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Notification types: system, client, employee, task
  const mockNotifications = [
    {
      id: 1,
      type: 'client',
      title: 'New Client Registration',
      message: 'TechCorp Inc. just registered on the platform and is waiting for approval.',
      time: '2 hours ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'employee',
      title: 'New Employee Application',
      message: 'Jane Smith applied for the Senior Graphic Designer position.',
      time: '3 hours ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'task',
      title: 'Task Deadline Approaching',
      message: 'Website redesign for ABC Corp is due in 2 days with 3 tasks pending.',
      time: '5 hours ago',
      isRead: true,
      priority: 'high'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update Scheduled',
      message: 'System maintenance scheduled for June 30, 2025, at 2:00 AM UTC.',
      time: '1 day ago',
      isRead: true,
      priority: 'low'
    },
    {
      id: 5,
      type: 'client',
      title: 'Service Payment Received',
      message: 'BlueSky Media completed payment for the Brand Identity Package.',
      time: '1 day ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'employee',
      title: 'Employee Contract Expiring',
      message: "Michael Johnson's contract expires in 7 days. Review renewal options.",
      time: '2 days ago',
      isRead: true,
      priority: 'medium'
    },
    {
      id: 7,
      type: 'task',
      title: 'Work Submission Review',
      message: 'New work submission from Alex Chen requires your review.',
      time: '2 days ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: 8,
      type: 'system',
      title: 'Server Performance Alert',
      message: 'High server load detected. Consider optimizing or scaling resources.',
      time: '3 days ago',
      isRead: true,
      priority: 'high'
    },
    {
      id: 9,
      type: 'client',
      title: 'Client Support Request',
      message: 'GlobalTech has submitted an urgent support ticket regarding their project.',
      time: '3 days ago',
      isRead: true,
      priority: 'high'
    },
    {
      id: 10,
      type: 'task',
      title: 'New Project Created',
      message: 'Social Media Campaign project has been created for InnovateTech.',
      time: '4 days ago',
      isRead: true,
      priority: 'medium'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  }, []);

  const getTypeIcon = (type, priority) => {
    const className = `h-10 w-10 p-2 rounded-full ${getTypeBgColor(type, priority)}`;
    
    switch (type) {
      case 'client':
        return <UserIcon className={className} />;
      case 'employee':
        return <UserIcon className={className} />;
      case 'task':
        return <ClockIcon className={className} />;
      case 'system':
        return <BellIcon className={className} />;
      default:
        return <BellIcon className={className} />;
    }
  };

  const getTypeBgColor = (type, priority) => {
    const priorityClasses = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-orange-600 bg-orange-100',
      low: 'text-blue-600 bg-blue-100'
    };
    
    return priorityClasses[priority] || 'text-gray-600 bg-gray-100';
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === filter);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Notifications
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'unread'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'client'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('client')}
            >
              Clients
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'employee'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('employee')}
            >
              Employees
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'task'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('task')}
            >
              Tasks
            </button>
          </li>
          <li>
            <button
              className={`inline-block p-4 rounded-t-lg ${
                filter === 'system'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setFilter('system')}
            >
              System
            </button>
          </li>
        </ul>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : getFilteredNotifications().length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <ExclamationCircleIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'unread' 
              ? "You've read all your notifications" 
              : "No notifications match your current filter"}
          </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {getFilteredNotifications().map((notification) => (
            <motion.div
              key={notification.id}
              variants={itemVariants}
              className={`p-4 rounded-lg border ${
                notification.isRead 
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                  : 'bg-blue-50 dark:bg-gray-700/50 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getTypeIcon(notification.type, notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      notification.priority === 'high' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : notification.priority === 'medium'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                    </span>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {notification.type}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 inline-flex text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="sr-only">Mark as read</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
