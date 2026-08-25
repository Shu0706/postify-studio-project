import { useState } from 'react';
import { motion } from 'framer-motion';
import serviceService from '../../services/serviceService';
import notificationManager from '../../utils/notificationManager';

const TestServiceRequest = () => {
  const [formData, setFormData] = useState({
    service: '',
    title: 'Test Service Request',
    description: 'This is a test service request to verify real-time notifications work correctly.',
    requirements: 'Test requirements',
    budget: {
      amount: 1000,
      currency: 'USD',
      type: 'fixed'
    },
    timeline: {
      preferredStartDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isUrgent: false
    },
    priority: 'medium'
  });

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available services
  const fetchServices = async () => {
    try {
      const response = await serviceService.getServices();
      if (response.success) {
        setServices(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, service: response.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Load services on component mount
  useState(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This would typically be done through a client service
      const response = await fetch(`${import.meta.env.VITE_API_URL}/client/request-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        notificationManager.success('Test service request submitted successfully!');
        // Reset form
        setFormData(prev => ({
          ...prev,
          title: 'Test Service Request ' + Date.now(),
          description: 'This is a test service request to verify real-time notifications work correctly.'
        }));
      } else {
        notificationManager.error('Failed to submit service request: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      notificationManager.error('Failed to submit service request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Test Service Request Form
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Use this form to test real-time notifications. When you submit a service request, 
          admin users should receive an immediate notification.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              name="budget.amount"
              value={formData.budget.amount}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preferred Start Date
              </label>
              <input
                type="date"
                name="timeline.preferredStartDate"
                value={formData.timeline.preferredStartDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                name="timeline.expectedDeliveryDate"
                value={formData.timeline.expectedDeliveryDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="timeline.isUrgent"
              checked={formData.timeline.isUrgent}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Mark as urgent
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Test Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default TestServiceRequest;
