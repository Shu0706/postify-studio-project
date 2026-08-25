import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const EmployeeSubmitWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    comments: '',
    files: []
  });

  // Simulate fetching task details
  useEffect(() => {
    // This would be an API call in a real application
    setTimeout(() => {
      const mockTask = {
        id: parseInt(id),
        title: 'Design homepage mockup for TechSolutions',
        description: 'Create a modern, responsive homepage design that highlights their new AI product line. The design should be clean, minimal, and focus on user experience. Include mobile and desktop versions.',
        dueDate: '2025-06-30',
        priority: 'High',
        status: 'In Progress',
        client: 'TechSolutions Inc.',
        assignedBy: 'Sarah Johnson',
        assignedDate: '2025-06-20',
        requirements: [
          'Modern and clean design aesthetic',
          'Responsive layout for all devices',
          'Focus on showcasing AI products',
          'Include call-to-action sections',
          'Follow client brand guidelines (provided in assets)',
          'Prepare both desktop and mobile versions'
        ],
        attachments: [
          { name: 'TechSolutions_Brand_Guidelines.pdf', size: '2.4 MB', date: '2025-06-20' },
          { name: 'Current_Homepage_Screenshots.zip', size: '8.1 MB', date: '2025-06-20' },
          { name: 'Reference_Designs.pdf', size: '4.7 MB', date: '2025-06-20' }
        ],
        history: [
          { action: 'Task created', date: '2025-06-20', by: 'Michael Chen' },
          { action: 'Task assigned to you', date: '2025-06-20', by: 'Sarah Johnson' },
          { action: 'You marked as In Progress', date: '2025-06-21', by: 'You' }
        ]
      };
      
      setTask(mockTask);
      setFormData({ status: mockTask.status, comments: '', files: [] });
      setLoading(false);
    }, 1000);
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: Array.from(e.target.files)
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitted work:', {
        taskId: id,
        ...formData
      });
      
      toast.success('Work submitted successfully!');
      setSubmitting(false);
      
      // Redirect back to tasks
      navigate('/employee/dashboard/tasks');
    }, 1500);
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
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary mb-2"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tasks
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Details
          </h1>
        </div>
        
        <div className="mt-4 md:mt-0">
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
            {task.priority} Priority
          </span>
          <span className={`ml-2 px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <motion.div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {task.title}
          </h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {task.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Client</h3>
              <p className="text-gray-700 dark:text-gray-300">{task.client}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Due Date</h3>
              <p className="text-gray-700 dark:text-gray-300">{task.dueDate}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned By</h3>
              <p className="text-gray-700 dark:text-gray-300">{task.assignedBy}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Requirements</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1">
              {task.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Attachments</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                {task.attachments.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">{file.size}</span>
                      <button className="text-primary hover:text-blue-700">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Submit Work Form */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Task Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task History
            </h3>
            <div className="space-y-4">
              {task.history.map((item, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className={`w-0.5 h-full ml-0.5 mt-1 bg-gray-200 dark:bg-gray-600 ${index === task.history.length - 1 ? 'hidden' : ''}`}></div>
                  </div>
                  <div className="ml-4 pb-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.date} by {item.by}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Work Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Submit Work
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Update Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows={4}
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Add any comments or notes about your work..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Files
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="files" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                        <span>Upload files</span>
                        <input
                          id="files"
                          name="files"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, PDF, DOC up to 10MB
                    </p>
                  </div>
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.files.length} file(s) selected
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Work'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeSubmitWork;
