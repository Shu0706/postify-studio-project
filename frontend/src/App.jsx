import { Suspense, lazy, useEffect } from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/ToastContainer';
import OfflineIndicator from './components/common/OfflineIndicator';
import notificationManager from './utils/notificationManager';
import logger from './utils/logger';

// Lazy load router for better performance
const AppRouter = lazy(() => import('./routes/AppRouter'));

function App() {
  useEffect(() => {
    // Initialize notification manager
    notificationManager.requestNotificationPermission();
    
    // Set up global error handler for uncaught exceptions
    const handleGlobalError = (event) => {
      logger.error('Uncaught error:', event.error);
      
      // Show toast notification for unhandled errors in production
      if (process.env.NODE_ENV === 'production' && window.toast) {
        window.toast.error('An unexpected error occurred');
      }
      
      // Prevent default browser error handling
      event.preventDefault();
    };
    
    // Set up global unhandled promise rejection handler
    const handleUnhandledRejection = (event) => {
      logger.error('Unhandled promise rejection:', event.reason);
      
      // Show toast notification for unhandled rejections in production
      if (process.env.NODE_ENV === 'production' && window.toast) {
        window.toast.error('An unexpected error occurred');
      }
      
      // Prevent default browser error handling
      event.preventDefault();
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
            <AppRouter />
          </Suspense>
          <ToastContainer />
          <OfflineIndicator />
          <ReactToastifyContainer 
            position="top-right" 
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
