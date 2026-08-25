import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import socketManager from '../../utils/socketManager';
import notificationManager from '../../utils/notificationManager';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent service requests
  const fetchRecentRequests = async () => {
    try {
      const response = await adminService.getServiceRequests({ limit: 5, page: 1 });
      if (response.success) {
        setRecentRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Recent requests fetch error:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentRequests();

    // Setup real-time listeners for new service requests
    const handleNewServiceRequest = (notification) => {
      notificationManager.showSystemNotification({
        title: 'New Service Request',
        message: notification.message,
        type: 'info'
      });
      
      // Refresh dashboard data
      fetchDashboardData();
      fetchRecentRequests();
    };

    // Listen for new service request notifications
    socketManager.on('newServiceRequestNotification', handleNewServiceRequest);

    return () => {
      socketManager.off('newServiceRequestNotification', handleNewServiceRequest);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {dashboardData?.admin?.name || currentUser?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Here's what's happening across your organization today.
        </p>
      </div>

      {/* Stats cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.totalClients || 0}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="font-medium">Active Users</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.totalEmployees || 0}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span className="font-medium">Team Members</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Requests</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.totalServiceRequests || 0}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              <span className="font-medium">Total Requests</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assignments</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.activeAssignments || 0}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span className="font-medium">In Progress</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Submissions</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.pendingSubmissions || 0}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              <span className="font-medium">Needs Review</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          variants={itemVariants}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {dashboardData?.overview?.completionRate || 0}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="font-medium">Overall Success</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick actions */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/admin/clients" className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Manage Clients</span>
          </Link>
          
          <Link to="/admin/employees" className="bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Manage Employees</span>
          </Link>
          
          <Link to="/admin/tasks" className="bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Assign Tasks</span>
          </Link>
          
          <Link to="/admin/work" className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Review Work</span>
          </Link>
          
          <Link to="/admin/requests" className="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Service Requests</span>
          </Link>
          
          <Link to="/admin/analytics" className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-4 rounded-lg text-center transition-colors">
            <svg className="h-6 w-6 mx-auto text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="block mt-2 text-sm text-gray-900 dark:text-white">Analytics</span>
          </Link>
        </div>
      </motion.div>

      {/* Recent service requests */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Service Requests</h2>
          <Link to="/admin/requests" className="text-sm text-primary hover:text-blue-600 font-medium">
            View all
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">No service requests yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.client?.firstName} {request.client?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{request.service?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : request.status === 'in-progress'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : request.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.priority === 'urgent' 
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : request.priority === 'high'
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          : request.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
