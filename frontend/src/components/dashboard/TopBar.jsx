import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import socketManager from '../../utils/socketManager';
import notificationManager from '../../utils/notificationManager';
import adminService from '../../services/adminService';

const TopBar = ({ onMenuButtonClick, user }) => {
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Simulate fetching notifications and messages
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (user?.role === 'admin') {
          const response = await adminService.getNotifications();
          if (response.success) {
            const recentNotifications = response.data.notifications?.slice(0, 5) || [];
            setNotifications(recentNotifications.map(notif => ({
              id: notif._id,
              title: notif.title,
              message: notif.message,
              read: notif.status === 'read',
              time: formatTimeAgo(notif.createdAt)
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to mock data
        setNotifications([
          { id: 1, title: 'Project update', message: 'Your project status has been updated', read: false, time: '5m ago' },
          { id: 2, title: 'New message', message: 'You have a new message from Admin', read: false, time: '1h ago' },
          { id: 3, title: 'Task completed', message: 'Task "Website Redesign" has been completed', read: true, time: '2d ago' },
        ]);
      }
    };

    const setupRealtimeListeners = () => {
      if (user?.role === 'admin') {
        // Listen for new service requests
        socketManager.on('newServiceRequest', (data) => {
          console.log('New service request received:', data);
          
          // Add to notifications list
          const newNotification = {
            id: `sr_${data.id}`,
            title: 'New Service Request',
            message: data.message,
            read: false,
            time: 'Just now'
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          
          // Show toast notification
          notificationManager.showSystemNotification({
            title: 'New Service Request',
            message: data.message,
            type: 'info'
          });

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            notificationManager.showBrowserNotification(
              'New Service Request',
              {
                body: data.message,
                icon: '/vite.svg',
                tag: `service-request-${data.id}`
              }
            );
          }
        });

        // Listen for general admin notifications
        socketManager.on('adminNotification', (notification) => {
          console.log('Admin notification received:', notification);
          
          const newNotification = {
            id: `admin_${Date.now()}`,
            title: notification.title,
            message: notification.message,
            read: false,
            time: 'Just now'
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          
          notificationManager.showSystemNotification({
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info'
          });
        });
      }
    };

    fetchNotifications();
    setupRealtimeListeners();

    // Mock messages data
    setMessages([
      { id: 1, sender: 'Admin', message: 'Hello, I have reviewed your project', read: false, time: '10m ago', avatar: '' },
      { id: 2, sender: 'Support', message: 'How can I help you today?', read: false, time: '3h ago', avatar: '' },
      { id: 3, sender: 'System', message: 'Your account has been verified', read: true, time: '1d ago', avatar: '' },
    ]);

    return () => {
      // Cleanup socket listeners
      socketManager.off('newServiceRequest');
      socketManager.off('adminNotification');
    };
  }, [user]);

  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Calculate unread counts
  useEffect(() => {
    setUnreadNotifications(notifications.filter(n => !n.read).length);
    setUnreadMessages(messages.filter(m => !m.read).length);
  }, [notifications, messages]);

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'employee':
        return '/employee/dashboard';
      case 'client':
      default:
        return '/dashboard';
    }
  };

  // Get chat URL based on user role
  const getChatUrl = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/chat';
      case 'employee':
        return '/employee/dashboard/chat';
      case 'client':
      default:
        return '/dashboard/chat';
    }
  };

  // Get notifications URL based on user role
  const getNotificationsUrl = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/notifications';
      case 'employee':
        return '/employee/dashboard/notifications';
      case 'client':
      default:
        return '/dashboard/notifications';
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Menu button (mobile only) */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
            onClick={onMenuButtonClick}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Center: Page title (hidden on mobile) */}
        <div className="hidden md:flex md:items-center">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {user?.role === 'admin' ? 'Admin Dashboard' : 
             user?.role === 'employee' ? 'Employee Dashboard' : 'Client Dashboard'}
          </h1>
        </div>

        {/* Right: User menu, notifications, theme toggle */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>

          {/* Messages dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none">
              <span className="sr-only">View messages</span>
              <div className="relative">
                <EnvelopeIcon className="h-6 w-6" aria-hidden="true" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">Messages</h3>
                  </div>
                  {messages.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      No messages
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <Menu.Item key={message.id}>
                          {({ active }) => (
                            <Link
                              to={getChatUrl()}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block px-4 py-2 text-sm ${
                                message.read ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-white'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  {message.avatar ? (
                                    <img src={message.avatar} alt={message.sender} className="h-10 w-10 rounded-full" />
                                  ) : (
                                    <span>{message.sender.charAt(0)}</span>
                                  )}
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between">
                                    <p className="text-sm font-medium">{message.sender}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{message.time}</p>
                                  </div>
                                  <p className="text-sm">{message.message}</p>
                                </div>
                              </div>
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={getChatUrl()}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block w-full text-center px-4 py-2 text-sm text-primary font-medium`}
                            >
                              View all messages
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Notifications dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-800 dark:text-white">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      No notifications
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <Link
                              to={getNotificationsUrl()}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block px-4 py-2 text-sm ${
                                notification.read ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-white'
                              }`}
                            >
                              <div>
                                <div className="flex justify-between">
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                                </div>
                                <p>{notification.message}</p>
                              </div>
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to={getNotificationsUrl()}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block w-full text-center px-4 py-2 text-sm text-primary font-medium`}
                            >
                              View all notifications
                            </Link>
                          )}
                        </Menu.Item>
                      </div>
                    </>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="ml-2 text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name || 'User'}
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={getDashboardUrl()}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      Dashboard
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => {
                    const profilePath = user?.role === 'admin' 
                      ? '/admin/profile' 
                      : user?.role === 'employee' 
                        ? '/employee/dashboard/profile' 
                        : '/dashboard/profile';
                    
                    return (
                      <Link
                        to={profilePath}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        Profile
                      </Link>
                    );
                  }}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
