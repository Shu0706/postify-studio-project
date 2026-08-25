import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/adminService';
import notificationManager from '../../utils/notificationManager';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    joinDate: ''
  });

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

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getEmployees({ search, status: filter === 'all' ? undefined : filter });
      if (response.success) {
        setEmployees(response.data.employees || []);
      } else {
        setError('Failed to load employees');
      }
    } catch (error) {
      console.error('Employees fetch error:', error);
      setError('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, filter]);

  // Handle input change for new employee form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.createEmployee(newEmployee);
      if (response.success) {
        notificationManager.success('Employee created successfully! Login credentials have been sent via email.');
        setShowAddModal(false);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          salary: '',
          joinDate: ''
        });
        fetchEmployees();
      }
    } catch (error) {
      console.error('Create employee error:', error);
      notificationManager.error('Failed to create employee');
    }
  };

  // View employee details
  const viewEmployeeDetails = async (employee) => {
    try {
      const response = await adminService.getEmployeeById(employee._id);
      if (response.success) {
        setSelectedEmployee(response.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      notificationManager.error('Failed to load employee details');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        const response = await adminService.deleteEmployee(id);
        if (response.success) {
          notificationManager.success('Employee deactivated successfully');
          fetchEmployees();
        }
      } catch (error) {
        console.error('Delete employee error:', error);
        notificationManager.error('Failed to deactivate employee');
      }
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.userId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.userId?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.department?.toLowerCase().includes(search.toLowerCase()) ||
      employee.position?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || 
      (filter === 'active' && employee.isActive) ||
      (filter === 'inactive' && !employee.isActive);

    return matchesSearch && matchesFilter;
  });

  if (isLoading && employees.length === 0) {
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
          Employee Management
        </h1>
        <button
          onClick={(e) => {
            // Prevent the opening click from immediately triggering backdrop close.
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => setShowAddModal(true), 0);
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
          type="button"
        >
          Add Employee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Employees
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Inactive
          </button>
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button 
            onClick={fetchEmployees}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Employees Table */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <motion.tr key={employee._id} variants={itemVariants}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {employee.userId?.firstName?.charAt(0)}{employee.userId?.lastName?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.userId?.firstName} {employee.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => viewEmployeeDetails(employee)}
                          className="text-primary hover:text-blue-700"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          {employee.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-employee-title">
          <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowAddModal(false);
              }}
            ></div>
            
            <motion.div 
              className="relative z-10 inline-block w-full max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg bg-white text-left shadow-xl dark:bg-gray-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleAddEmployee}>
                <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 id="add-employee-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    Add New Employee
                  </h3>
                </div>
                
                <div className="bg-white dark:bg-gray-800 px-6 py-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={newEmployee.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={newEmployee.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department *
                      </label>
                      <select
                        name="department"
                        value={newEmployee.department}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Department</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Management">Management</option>
                        <option value="Sales">Sales</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Position *
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={newEmployee.position}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Salary
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={newEmployee.salary}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Join Date
                      </label>
                      <input
                        type="date"
                        name="joinDate"
                        value={newEmployee.joinDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> Login credentials will be automatically generated and sent to the employee's email address.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600"
                  >
                    Create Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDetailsModal(false)}></div>
            
            <motion.div 
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Employee Details
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
              
              <div className="bg-white dark:bg-gray-800 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedEmployee.employee?.userId?.firstName} {selectedEmployee.employee?.userId?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.employee?.userId?.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.employee?.userId?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Work Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Employee ID:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.employee?.employeeId}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Department:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.employee?.department}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Position:</span>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.employee?.position}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Join Date:</span>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(selectedEmployee.employee?.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedEmployee.performance && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Performance</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Assignments</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEmployee.performance.totalAssignments}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEmployee.performance.completedAssignments}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEmployee.performance.completionRate}%
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedEmployee.performance.averageRating}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
