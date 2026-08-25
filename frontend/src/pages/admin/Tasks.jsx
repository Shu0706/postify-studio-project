import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Mock data for tasks and assignments
const MOCK_TASKS = [
  { 
    id: 1, 
    title: 'Website Redesign for TechSolutions', 
    description: 'Complete overhaul of the company website with modern design principles and improved UX',
    client: 'TechSolutions Inc.',
    service: 'Web Development',
    deadline: '2025-07-15', 
    status: 'In Progress',
    assignedTo: [
      { id: 1, name: 'John Doe', position: 'Senior Graphic Designer' },
      { id: 5, name: 'David Brown', position: 'Frontend Developer' }
    ],
    priority: 'High',
    createdAt: '2025-06-10'
  },
  { 
    id: 2, 
    title: 'Summer Collection Social Media Campaign', 
    description: 'Design and execute a social media campaign for the summer fashion collection launch',
    client: 'FashionHub',
    service: 'Social Media Marketing',
    deadline: '2025-07-01', 
    status: 'In Progress',
    assignedTo: [
      { id: 2, name: 'Jane Smith', position: 'Content Strategist' },
      { id: 6, name: 'Emily Davis', position: 'Social Media Manager' }
    ],
    priority: 'Medium',
    createdAt: '2025-06-15'
  },
  { 
    id: 3, 
    title: 'Brand Identity Update', 
    description: 'Refresh the visual identity including logo, color palette, and typography',
    client: 'GreenEats Organic',
    service: 'Branding',
    deadline: '2025-07-30', 
    status: 'Not Started',
    assignedTo: [
      { id: 3, name: 'Mike Johnson', position: 'UI/UX Designer' }
    ],
    priority: 'Medium',
    createdAt: '2025-06-18'
  },
  { 
    id: 4, 
    title: 'SEO Performance Optimization', 
    description: 'Comprehensive SEO audit and implementation of recommendations to improve search rankings',
    client: 'SkyTravel Adventures',
    service: 'SEO',
    deadline: '2025-07-10', 
    status: 'In Progress',
    assignedTo: [
      { id: 4, name: 'Sarah Williams', position: 'SEO Specialist' }
    ],
    priority: 'High',
    createdAt: '2025-06-05'
  },
  { 
    id: 5, 
    title: 'Email Marketing Campaign for Q3', 
    description: 'Design and develop email templates and content strategy for Q3 promotions',
    client: 'HealthFirst Clinic',
    service: 'Email Marketing',
    deadline: '2025-07-20', 
    status: 'Not Started',
    assignedTo: [
      { id: 10, name: 'Jessica Lee', position: 'Content Writer' },
      { id: 6, name: 'Emily Davis', position: 'Social Media Manager' }
    ],
    priority: 'Medium',
    createdAt: '2025-06-19'
  },
  { 
    id: 6, 
    title: 'Monthly Newsletter Design', 
    description: 'Create an engaging newsletter template with custom illustrations',
    client: 'BookLovers Club',
    service: 'Graphic Design',
    deadline: '2025-06-30', 
    status: 'In Progress',
    assignedTo: [
      { id: 11, name: 'Thomas Martin', position: 'Illustrator' }
    ],
    priority: 'Low',
    createdAt: '2025-06-20'
  },
  { 
    id: 7, 
    title: 'Product Photography for New Collection', 
    description: 'Professional photography for the new athletic shoe line, including lifestyle shots',
    client: 'SportyGear',
    service: 'Photography',
    deadline: '2025-07-05', 
    status: 'Completed',
    assignedTo: [
      { id: 9, name: 'Robert Taylor', position: 'Motion Designer' }
    ],
    priority: 'High',
    createdAt: '2025-06-01'
  },
  { 
    id: 8, 
    title: 'Veterinary Services Landing Page', 
    description: 'Design and develop a conversion-optimized landing page for new veterinary services',
    client: 'PetPals Veterinary',
    service: 'Web Development',
    deadline: '2025-07-25', 
    status: 'Not Started',
    assignedTo: [],
    priority: 'Medium',
    createdAt: '2025-06-22'
  },
  { 
    id: 9, 
    title: 'Business Cards and Stationery Design', 
    description: 'Design premium business cards, letterheads, and envelopes for the entire firm',
    client: 'LegalEdge Associates',
    service: 'Print Design',
    deadline: '2025-06-28', 
    status: 'Completed',
    assignedTo: [
      { id: 1, name: 'John Doe', position: 'Senior Graphic Designer' }
    ],
    priority: 'Low',
    createdAt: '2025-06-10'
  },
  { 
    id: 10, 
    title: 'E-commerce Product Page Redesign', 
    description: 'Improve the user experience and conversion rate of product pages',
    client: 'HomeStyle Furnishings',
    service: 'UX Design',
    deadline: '2025-07-18', 
    status: 'Not Started',
    assignedTo: [
      { id: 3, name: 'Mike Johnson', position: 'UI/UX Designer' },
      { id: 5, name: 'David Brown', position: 'Frontend Developer' }
    ],
    priority: 'High',
    createdAt: '2025-06-17'
  }
];

// Mock employees for assignment
const MOCK_EMPLOYEES = [
  { id: 1, name: 'John Doe', position: 'Senior Graphic Designer', department: 'Design' },
  { id: 2, name: 'Jane Smith', position: 'Content Strategist', department: 'Marketing' },
  { id: 3, name: 'Mike Johnson', position: 'UI/UX Designer', department: 'Design' },
  { id: 4, name: 'Sarah Williams', position: 'SEO Specialist', department: 'Marketing' },
  { id: 5, name: 'David Brown', position: 'Frontend Developer', department: 'Development' },
  { id: 6, name: 'Emily Davis', position: 'Social Media Manager', department: 'Marketing' },
  { id: 7, name: 'Kevin Wilson', position: 'Backend Developer', department: 'Development' },
  { id: 8, name: 'Lisa Moore', position: 'Project Manager', department: 'Management' },
  { id: 9, name: 'Robert Taylor', position: 'Motion Designer', department: 'Design' },
  { id: 10, name: 'Jessica Lee', position: 'Content Writer', department: 'Marketing' }
];

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    client: '',
    service: '',
    deadline: '',
    priority: 'Medium'
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  // Simulate fetching data
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      setTasks(MOCK_TASKS);
      setEmployees(MOCK_EMPLOYEES);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return task.assignedTo.length === 0;
    return task.status.toLowerCase().replace(' ', '-') === filter;
  });

  // Search tasks
  const searchedTasks = filteredTasks.filter(task => {
    const searchTerm = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchTerm) ||
      task.client.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  });

  // Handle new task form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  // Handle add task submission
  const handleAddTask = (e) => {
    e.preventDefault();
    
    // This would be an API call in a real application
    // For now, just add to the local state
    const newTaskData = {
      ...newTask,
      id: tasks.length + 1,
      status: 'Not Started',
      assignedTo: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTasks([...tasks, newTaskData]);
    setShowAddModal(false);
    setNewTask({
      title: '',
      description: '',
      client: '',
      service: '',
      deadline: '',
      priority: 'Medium'
    });
  };

  // Open assign modal for a task
  const openAssignModal = (task) => {
    setCurrentTask(task);
    setShowAssignModal(true);
  };

  // Handle task assignment
  const handleAssignTask = (e, employeeId) => {
    e.preventDefault();
    
    // Find the employee
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    // Check if already assigned
    const isAlreadyAssigned = currentTask.assignedTo.some(emp => emp.id === employeeId);
    if (isAlreadyAssigned) return;
    
    // Update the task with the new assignment
    const updatedTasks = tasks.map(task => {
      if (task.id === currentTask.id) {
        return {
          ...task,
          assignedTo: [...task.assignedTo, { 
            id: employee.id, 
            name: employee.name, 
            position: employee.position 
          }]
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update the current task
    setCurrentTask({
      ...currentTask,
      assignedTo: [...currentTask.assignedTo, { 
        id: employee.id, 
        name: employee.name, 
        position: employee.position 
      }]
    });
  };

  // Remove an assignment
  const handleRemoveAssignment = (taskId, employeeId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedTo: task.assignedTo.filter(emp => emp.id !== employeeId)
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update current task if open in modal
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask({
        ...currentTask,
        assignedTo: currentTask.assignedTo.filter(emp => emp.id !== employeeId)
      });
    }
  };

  // Function to determine badge color based on priority
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Function to determine badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Task Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Create New Task
        </button>
      </div>

      {/* Stats summary */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {tasks.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              <span className="font-medium">+3</span> this week
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {tasks.filter(task => task.status === 'In Progress').length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {Math.round(tasks.filter(task => task.status === 'In Progress').length / tasks.length * 100)}% of total
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {tasks.filter(task => task.status === 'Completed').length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {Math.round(tasks.filter(task => task.status === 'Completed').length / tasks.length * 100)}% of total
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Unassigned</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {tasks.filter(task => task.assignedTo.length === 0).length}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Needs attention
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and search */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'in-progress'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('not-started')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'not-started'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Not Started
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'completed'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'unassigned'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unassigned
          </button>
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Tasks table */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {searchedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">No tasks found. Try changing your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchedTasks.map((task) => (
                  <motion.tr 
                    key={task.id}
                    variants={itemVariants}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.client}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{task.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{task.deadline}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignedTo.length === 0 ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">Not assigned</span>
                      ) : (
                        <div className="flex flex-col space-y-1">
                          {task.assignedTo.map((employee) => (
                            <div key={employee.id} className="flex items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{employee.name}</span>
                              <button 
                                onClick={() => handleRemoveAssignment(task.id, employee.id)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openAssignModal(task)}
                          className="text-primary hover:text-blue-700"
                        >
                          Assign
                        </button>
                        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                          Edit
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

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newTask.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      value={newTask.client}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Type
                    </label>
                    <input
                      type="text"
                      name="service"
                      value={newTask.service}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={newTask.deadline}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && currentTask && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign Task: {currentTask.title}
                </h3>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Assignments
                </h4>
                {currentTask.assignedTo.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No employees assigned yet</p>
                ) : (
                  <div className="flex flex-col space-y-2">
                    {currentTask.assignedTo.map(employee => (
                      <div key={employee.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{employee.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({employee.position})</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveAssignment(currentTask.id, employee.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Employees
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {employees.filter(emp => !currentTask.assignedTo.some(assigned => assigned.id === emp.id)).map(employee => (
                    <div 
                      key={employee.id} 
                      className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{employee.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{employee.position}</div>
                      </div>
                      <button 
                        onClick={(e) => handleAssignTask(e, employee.id)}
                        className="text-primary hover:text-blue-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
