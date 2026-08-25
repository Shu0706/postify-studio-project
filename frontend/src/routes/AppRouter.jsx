import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute, RoleBasedRoute, PublicOnlyRoute } from './ProtectedRoutes';

// Layouts
import MainLayout from '../layout/MainLayout';
import SinglePageLayout from '../layout/SinglePageLayout';
import DashboardLayout from '../layout/DashboardLayout';
import AdminLayout from '../layout/AdminLayout';
import EmployeeLayout from '../layout/EmployeeLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import ContactPage from '../pages/public/ContactPage';
import NewLoginPage from '../pages/public/NewLoginPage';
import NewSignupPage from '../pages/public/NewSignupPage';
import SignupPage from '../pages/public/SignupPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Client Pages
import ClientDashboard from '../pages/client/Dashboard';
import ClientServices from '../pages/client/Services';
import ClientApplyService from '../pages/client/ApplyService';
import ClientProjects from '../pages/client/Projects';
import ClientDownloads from '../pages/client/Downloads';
import ClientNotifications from '../pages/client/Notifications';
import ClientChat from '../pages/client/Chat';
import ClientAIChat from '../pages/client/AIChat';
import ClientProfile from '../pages/client/Profile';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminClients from '../pages/admin/Clients';
import AdminEmployees from '../pages/admin/Employees';
import AdminTasks from '../pages/admin/Tasks';
import AdminWork from '../pages/admin/Work';
import AdminChat from '../pages/admin/Chat';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminNotifications from '../pages/admin/Notifications';
import AdminServiceManagement from '../pages/admin/ServiceManagement';

// Employee Pages
import EmployeeDashboard from '../pages/employee/Dashboard';
import EmployeeTasks from '../pages/employee/Tasks';
import EmployeeSubmitWork from '../pages/employee/SubmitWork';
import EmployeeChat from '../pages/employee/Chat';
import EmployeeNotifications from '../pages/employee/Notifications';
import EmployeeProfile from '../pages/employee/Profile';

const router = createBrowserRouter([
  // Single Page Home Route - Using Updated HomePage
  {
    path: '/',
    element: <HomePage />
  },
  // Other Public Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'contact', element: <ContactPage /> },
    ]
  },
  // Auth Routes (Public only if not logged in) - Using New Designs
  {
    element: <PublicOnlyRoute forceAccess={true} />,
    children: [
      { path: 'login', element: <NewLoginPage /> },
      { path: 'signup', element: <NewSignupPage /> },
      // Legacy signup page for comparison
      { path: 'old-signup', element: <SignupPage /> },
    ]
  },
  // Client Routes
  {
    element: <RoleBasedRoute allowedRoles={['client']} />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <ClientDashboard /> },
          { path: 'services', element: <ClientServices /> },
          { path: 'services/apply/:id', element: <ClientApplyService /> },
          { path: 'projects', element: <ClientProjects /> },
          { path: 'downloads', element: <ClientDownloads /> },
          { path: 'notifications', element: <ClientNotifications /> },
          { path: 'chat', element: <ClientChat /> },
          { path: 'ai-assistant', element: <ClientAIChat /> },
          { path: 'profile', element: <ClientProfile /> },
        ]
      }
    ]
  },
  // Admin Routes
  {
    element: <RoleBasedRoute allowedRoles={['admin']} />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'clients', element: <AdminClients /> },
          { path: 'employees', element: <AdminEmployees /> },
          { path: 'services', element: <AdminServiceManagement /> },
          { path: 'tasks', element: <AdminTasks /> },
          { path: 'work', element: <AdminWork /> },
          { path: 'chat', element: <AdminChat /> },
          { path: 'analytics', element: <AdminAnalytics /> },
          { path: 'notifications', element: <AdminNotifications /> },
        ]
      }
    ]
  },
  // Employee Routes
  {
    element: <RoleBasedRoute allowedRoles={['employee']} />,
    children: [
      {
        path: 'employee/dashboard',
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <EmployeeDashboard /> },
          { path: 'tasks', element: <EmployeeTasks /> },
          { path: 'submit-work/:id', element: <EmployeeSubmitWork /> },
          { path: 'chat', element: <EmployeeChat /> },
          { path: 'notifications', element: <EmployeeNotifications /> },
          { path: 'profile', element: <EmployeeProfile /> },
        ]
      }
    ]
  },
  // 404 Route
  { path: '*', element: <NotFoundPage /> }
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
