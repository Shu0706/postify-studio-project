import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import socketManager from '../../utils/socketManager';
import notificationManager from '../../utils/notificationManager';

const RealtimeNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const handleNewServiceRequest = (data) => {
      const notification = {
        id: `sr_${data.id}_${Date.now()}`,
        type: 'service-request',
        title: 'New Service Request',
        message: `${data.clientName} submitted "${data.title}"`,
        timestamp: new Date(),
        priority: data.priority,
        actionUrl: `/admin/service-requests/${data.id}`,
        data: data
      };

      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      setShowToast(true);
      
      // Auto hide toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);

      // Show browser notification
      if (Notification.permission === 'granted') {
        const browserNotif = new Notification('New Service Request', {
          body: notification.message,
          icon: '/vite.svg',
          tag: `service-request-${data.id}`,
          requireInteraction: true
        });

        browserNotif.onclick = () => {
          window.focus();
          window.location.href = notification.actionUrl;
          browserNotif.close();
        };
      }

      // Play notification sound
      notificationManager.playNotificationSound();
    };

    const handleAdminNotification = (notification) => {
      if (notification.type === 'service-request') {
        const newNotif = {
          id: `admin_${Date.now()}`,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.timestamp),
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          data: notification.data
        };

        setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
        setShowToast(true);
        
        setTimeout(() => setShowToast(false), 5000);
      }
    };

  // Set up socket listeners (support both client- and server-side event names)
  socketManager.on('newServiceRequest', handleNewServiceRequest);
  socketManager.on('new-service-request', handleNewServiceRequest);
  socketManager.on('adminNotification', handleAdminNotification);
  socketManager.on('new-notification', handleAdminNotification);

    return () => {
  socketManager.off('newServiceRequest', handleNewServiceRequest);
  socketManager.off('new-service-request', handleNewServiceRequest);
  socketManager.off('adminNotification', handleAdminNotification);
  socketManager.off('new-notification', handleAdminNotification);
    };
  }, [currentUser]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const dismissToast = () => {
    setShowToast(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-500',
      'medium': 'bg-yellow-500',
      'high': 'bg-orange-500',
      'urgent': 'bg-red-500'
    };
    return colors[priority] || 'bg-blue-500';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <>
      {/* Toast notification */}
      <AnimatePresence>
        {showToast && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 z-50 w-80"
          >
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getPriorityColor(notifications[0]?.priority)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <BellIcon className="h-5 w-5 text-blue-500" />
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {notifications[0]?.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notifications[0]?.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(notifications[0]?.timestamp)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissToast}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {notifications[0]?.actionUrl && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={notifications[0].actionUrl}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    onClick={dismissToast}
                  >
                    View Details →
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating notification indicator */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
            <div className="relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default RealtimeNotifications;
