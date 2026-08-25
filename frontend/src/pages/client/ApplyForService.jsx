import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const ApplyForService = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [formData, setFormData] = useState({
    serviceType: '',
    title: '',
    description: '',
    requirements: '',
    budget: {
      amount: '',
      currency: 'INR',
      type: 'fixed'
    },
    timeline: {
      preferredStartDate: '',
      expectedDeliveryDate: '',
      isUrgent: false
    },
    attachments: []
  });

  // Service types with descriptions
  const serviceTypes = [
    {
      id: 'social-media-management',
      name: 'Social Media Management',
      description: 'Complete social media strategy, content creation, and management',
      icon: '📱'
    },
    {
      id: 'graphic-design',
      name: 'Graphic Design',
      description: 'Logo design, branding, marketing materials, and visual content',
      icon: '🎨'
    },
    {
      id: 'content-writing',
      name: 'Content Writing',
      description: 'Blog posts, articles, website copy, and marketing content',
      icon: '✍️'
    },
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Website design, development, and maintenance',
      icon: '💻'
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing',
      description: 'SEO, PPC, email marketing, and online advertising',
      icon: '📈'
    },
    {
      id: 'video-editing',
      name: 'Video Editing',
      description: 'Video production, editing, and post-production services',
      icon: '🎬'
    }
  ];

  useEffect(() => {
    // Set minimum dates for timeline
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        preferredStartDate: today,
        expectedDeliveryDate: nextWeek
      }
    }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const validateForm = () => {
    if (!formData.serviceType) {
      showToastMessage('Please select a service type', 'error');
      return false;
    }
    if (!formData.title.trim()) {
      showToastMessage('Please enter a project title', 'error');
      return false;
    }
    if (!formData.description.trim()) {
      showToastMessage('Please provide project description', 'error');
      return false;
    }
    if (!formData.budget.amount || formData.budget.amount <= 0) {
      showToastMessage('Please enter a valid budget amount', 'error');
      return false;
    }
    if (!formData.timeline.preferredStartDate) {
      showToastMessage('Please select preferred start date', 'error');
      return false;
    }
    if (!formData.timeline.expectedDeliveryDate) {
      showToastMessage('Please select expected delivery date', 'error');
      return false;
    }
    
    // Check if delivery date is after start date
    if (new Date(formData.timeline.expectedDeliveryDate) <= new Date(formData.timeline.preferredStartDate)) {
      showToastMessage('Delivery date must be after start date', 'error');
      return false;
    }

    return true;
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add basic form data
      submitData.append('serviceType', formData.serviceType);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('requirements', formData.requirements);
      
      // Add budget data
      submitData.append('budget', JSON.stringify(formData.budget));
      
      // Add timeline data
      submitData.append('timeline', JSON.stringify(formData.timeline));
      
      // Add files
      formData.attachments.forEach((file, index) => {
        submitData.append('attachments', file);
      });

      const response = await fetch('/api/client/request-service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        showToastMessage('Service request submitted successfully! You will receive a confirmation email shortly.', 'success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to submit service request');
      }
      
    } catch (error) {
      console.error('Error submitting service request:', error);
      showToastMessage(error.message || 'Failed to submit service request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for New Service</h1>
            <p className="text-gray-600">Tell us about your project and we'll match you with the right expert.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Service Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.serviceType === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, serviceType: service.id }))}
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Social Media Management for Fitness Brand"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="budget.amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (₹) *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    id="budget.amount"
                    name="budget.amount"
                    value={formData.budget.amount}
                    onChange={handleInputChange}
                    placeholder="25000"
                    min="1000"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <select
                    name="budget.type"
                    value={formData.budget.type}
                    onChange={handleInputChange}
                    className="px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-lg bg-gray-50"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Per Hour</option>
                    <option value="package">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your project requirements, goals, and any specific details..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Specific Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any specific requirements, brand guidelines, or preferences..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeline.preferredStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Date *
                </label>
                <input
                  type="date"
                  id="timeline.preferredStartDate"
                  name="timeline.preferredStartDate"
                  value={formData.timeline.preferredStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="timeline.expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  id="timeline.expectedDeliveryDate"
                  name="timeline.expectedDeliveryDate"
                  value={formData.timeline.expectedDeliveryDate}
                  onChange={handleInputChange}
                  min={formData.timeline.preferredStartDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Urgent Flag */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="timeline.isUrgent"
                name="timeline.isUrgent"
                checked={formData.timeline.isUrgent}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="timeline.isUrgent" className="ml-2 block text-sm text-gray-700">
                This is an urgent project (may incur additional charges)
              </label>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Upload any reference files, logos, brand guidelines, or examples (Max 10MB per file)
              </p>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.rar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="text-sm text-gray-600">
                    {formData.attachments.map((file, index) => (
                      <li key={index} className="flex justify-between items-center py-1">
                        <span>{file.name}</span>
                        <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ApplyForService;
