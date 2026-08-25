import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import socketManager from '../../utils/socketManager';
import notificationManager from '../../utils/notificationManager';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  // Fetch service requests
  const fetchRequests = async (page = 1, status = filter, searchTerm = search) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 10,
        ...(status !== 'all' && { status }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await adminService.getServiceRequests(params);
      if (response.success) {
        setRequests(response.data.requests || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError('Failed to load service requests');
      }
    } catch (error) {
      console.error('Service requests fetch error:', error);
      setError('Failed to load service requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Setup real-time listeners
    const handleNewServiceRequest = (data) => {
      console.log('New service request notification:', data);
      
      notificationManager.showSystemNotification({
        title: 'New Service Request',
        message: data.message,
        type: 'info'
      });
      
      // Refresh the list
      fetchRequests(currentPage, filter, search);
    };

    const handleAdminNotification = (notification) => {
      if (notification.type === 'service-request') {
        console.log('Admin notification for service request:', notification);
        
        notificationManager.showSystemNotification({
          title: notification.title,
          message: notification.message,
          type: 'info'
        });
        
        // Refresh the list
        fetchRequests(currentPage, filter, search);
      }
    };

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
  }, [currentPage, filter, search]);

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchRequests(1, newFilter, search);
  };

  // Handle search
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
    setCurrentPage(1);
    fetchRequests(1, filter, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchRequests(page, filter, search);
  };

  // View request details
  const viewRequestDetails = async (requestId) => {
    try {
      const response = await adminService.getServiceRequestById(requestId);
      if (response.success) {
        setSelectedRequest(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      notificationManager.error('Failed to load request details');
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const response = await adminService.updateServiceRequestStatus(requestId, { status: newStatus });
      if (response.success) {
        notificationManager.success('Request status updated successfully');
        fetchRequests(currentPage, filter, search);
        if (selectedRequest && selectedRequest._id === requestId) {
          setSelectedRequest({ ...selectedRequest, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      notificationManager.error('Failed to update request status');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'reviewing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'quoted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'assigned': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'on-hold': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (isLoading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Service Requests
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: {requests.length}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'reviewing', label: 'Reviewing' },
            { key: 'quoted', label: 'Quoted' },
            { key: 'approved', label: 'Approved' },
            { key: 'assigned', label: 'Assigned' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button 
            onClick={() => fetchRequests(currentPage, filter, search)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Service Requests Table */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {requests.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">No service requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                  <motion.tr key={request._id} variants={itemVariants}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {request.client?.firstName} {request.client?.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.client?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {request.service?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.service?.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${request.budget?.amount?.toLocaleString()} {request.budget?.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => viewRequestDetails(request._id)}
                          className="text-primary hover:text-blue-700"
                        >
                          View
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateRequestStatus(request._id, 'reviewing')}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Review
                            </button>
                            <button 
                              onClick={() => updateRequestStatus(request._id, 'approved')}
                              className="text-green-600 hover:text-green-800"
                            >
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-primary border-primary text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
            
            <motion.div 
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Service Request Details
                  </h3>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 px-6 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Request Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Title:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.title}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Description:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.description}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Requirements:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.requirements || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Client Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedRequest.client?.firstName} {selectedRequest.client?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.client?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Service & Budget</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.service?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Budget:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          ${selectedRequest.budget?.amount?.toLocaleString()} {selectedRequest.budget?.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Preferred Start:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedRequest.timeline?.preferredStartDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Expected Delivery:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedRequest.timeline?.expectedDeliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Attachments</h4>
                    <div className="space-y-1">
                      {selectedRequest.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">{attachment.originalName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest._id, 'reviewing');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Start Review
                    </button>
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest._id, 'approved');
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
