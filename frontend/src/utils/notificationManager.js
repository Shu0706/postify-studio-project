import { toast } from 'react-toastify';
import socketManager from './socketManager';

class NotificationManager {
  constructor() {
    this.isInitialized = false;
    this.setupNotificationListeners();
    this.requestNotificationPermission();
  }

  setupNotificationListeners() {
    if (this.isInitialized) return;

    // Listen for new message notifications
    socketManager.on('newMessageNotification', (notification) => {
      this.showMessageNotification(notification);
    });

    // Listen for system notifications
    socketManager.on('systemNotification', (notification) => {
      this.showSystemNotification(notification);
    });

    this.isInitialized = true;
  }

  showMessageNotification(data) {
    const { senderName, content, conversationId } = data;
    
    toast.info(
      `${senderName}: ${content}`,
      {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          // Navigate to chat conversation
          window.location.href = `/chat?conversation=${conversationId}`;
        }
      }
    );

    // Play notification sound (optional)
    this.playNotificationSound();
  }

  showSystemNotification(data) {
    const { title, message, type = 'info' } = data;
    
    const toastMethod = {
      'success': toast.success,
      'error': toast.error,
      'warning': toast.warn,
      'info': toast.info
    }[type] || toast.info;

    toastMethod(
      `${title}: ${message}`,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      }
    );
  }

  showTaskNotification(data) {
    const { title, message, actionUrl } = data;
    
    toast.info(
      `${title}: ${message}${actionUrl ? ' (Click to view)' : ''}`,
      {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      }
    );
  }

  playNotificationSound() {
    try {
      // Create a simple notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Fallback: try to play a simple beep using HTML5 audio
      console.log('Notification sound not available');
    }
  }

  // Request permission for browser notifications
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show native browser notification
  showBrowserNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }

  // Utility methods for common notification types
  success(message) {
    toast.success(message);
  }

  error(message) {
    toast.error(message);
  }

  warning(message) {
    toast.warn(message);
  }

  info(message) {
    toast.info(message);
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
