import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Protected route component that requires authentication
 * If user is not authenticated, redirects to login
 */
export const ProtectedRoute = () => {
  const { currentUser, loading, tokenRefreshing } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  console.log('🔒 ProtectedRoute: currentUser:', currentUser);
  console.log('🔒 ProtectedRoute: loading:', loading, 'tokenRefreshing:', tokenRefreshing);
  
  // Add a slight delay to prevent flashing between states
  useEffect(() => {
    if (!loading && !tokenRefreshing) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 300); // Reduced from 500ms to 300ms for faster loading
      
      return () => clearTimeout(timer);
    }
  }, [loading, tokenRefreshing]);
  
  // Show loading state while checking authentication
  if (loading || tokenRefreshing || isPageLoading) {
    console.log('🔒 ProtectedRoute: Showing loading state');
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('🔒 ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('🔒 ProtectedRoute: Access granted, rendering child routes');
  // Render child routes if authenticated
  return <Outlet />;
};

/**
 * Role-based protected route component
 * Requires authentication and specific role(s)
 * @param {Object} props - Component props
 * @param {string|string[]} props.allowedRoles - Allowed role(s) for this route
 */
export const RoleBasedRoute = ({ allowedRoles }) => {
  const { currentUser, loading, tokenRefreshing } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  console.log('🛡️ RoleBasedRoute: currentUser:', currentUser);
  console.log('🛡️ RoleBasedRoute: loading:', loading, 'tokenRefreshing:', tokenRefreshing);
  
  // Add a slight delay to prevent flashing between states
  useEffect(() => {
    if (!loading && !tokenRefreshing) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 300); // Reduced from 500ms to 300ms
      
      return () => clearTimeout(timer);
    }
  }, [loading, tokenRefreshing]);
  
  // Show loading state while checking authentication
  if (loading || tokenRefreshing || isPageLoading) {
    console.log('🛡️ RoleBasedRoute: Showing loading state');
    return <LoadingSpinner message="Authenticating..." />;
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('🛡️ RoleBasedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRequiredRole = roles.includes(currentUser.role);
  
  console.log('🛡️ RoleBasedRoute: User role:', currentUser.role, 'Required roles:', roles, 'Has access:', hasRequiredRole);
  
  // Redirect to appropriate dashboard if user doesn't have the required role
  if (!hasRequiredRole) {
    console.log('🛡️ RoleBasedRoute: User does not have required role, redirecting based on role');
    // Redirect based on user role
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'employee':
        return <Navigate to="/employee/dashboard" replace />;
      case 'client':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  console.log('🛡️ RoleBasedRoute: Access granted, rendering child routes');
  // Render child routes if authenticated and has required role
  return <Outlet />;
};

/**
 * Public route component that redirects authenticated users to their dashboard
 * @param {Object} props - Component props
 * @param {boolean} props.forceAccess - If true, allow access to the route even when logged in
 */
export const PublicOnlyRoute = ({ forceAccess = false }) => {
  const { currentUser, loading, tokenRefreshing } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Add a slight delay to prevent flashing between states
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state while checking authentication
  if (loading || tokenRefreshing || isPageLoading) {
    return <LoadingSpinner message="Loading..." />;
  }
  
  // Redirect authenticated users to their dashboard, unless forceAccess is true
  if (currentUser && !forceAccess) {
    // Redirect based on user role
    switch (currentUser.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'employee':
        return <Navigate to="/employee/dashboard" replace />;
      case 'client':
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Render child routes if not authenticated or if forceAccess is true
  return <Outlet />;
};
