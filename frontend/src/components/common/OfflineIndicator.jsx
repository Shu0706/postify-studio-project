import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOnline } = useAuth();
  const [showIndicator, setShowIndicator] = useState(!isOnline);
  const [closing, setClosing] = useState(false);
  
  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
      setClosing(false);
    } else {
      // Start closing animation when going back online
      if (showIndicator) {
        setClosing(true);
        const timer = setTimeout(() => {
          setShowIndicator(false);
          setClosing(false);
        }, 3000); // Match this with the CSS animation duration
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, showIndicator]);
  
  if (!showIndicator) return null;
  
  return (
    <div className={`offline-indicator ${closing ? 'closing' : ''}`}>
      <div className="offline-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>
          {isOnline 
            ? 'Connection restored! Syncing data...' 
            : 'You are offline. Some features may be unavailable.'}
        </span>
        {isOnline && (
          <button 
            className="close-button" 
            onClick={() => setClosing(true)}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
