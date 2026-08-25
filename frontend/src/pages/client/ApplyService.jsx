import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviceService } from '../../services/serviceService';
import { toast } from 'react-toastify';

const ClientApplyService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    budget: '',
    deadline: '',
    additionalInfo: '',
    files: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Fetch service details from API
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getServiceById(id);
        if (response.success) {
          setService(response.data);
        } else {
          toast.error('Service not found');
          navigate('/dashboard/services');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Error loading service details');
        navigate('/dashboard/services');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id, navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: Array.from(e.target.files)
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.projectName.trim()) {
      errors.projectName = 'Project name is required';
    } else if (formData.projectName.trim().length < 5) {
      errors.projectName = 'Project name must be at least 5 characters';
    } else if (formData.projectName.trim().length > 200) {
      errors.projectName = 'Project name cannot exceed 200 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Description must be at least 20 characters';
    } else if (formData.description.trim().length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }
    
    if (!formData.budget.trim()) {
      errors.budget = 'Budget is required';
    } else if (isNaN(parseFloat(formData.budget))) {
      errors.budget = 'Budget must be a number';
    } else if (parseFloat(formData.budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }
    
    if (!formData.deadline.trim()) {
      errors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (selectedDate <= today) {
        errors.deadline = 'Deadline must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get default image based on service category
  const getServiceImage = (service) => {
    const categoryImages = {
      'web-development': 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'social-media-management': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'content-writing': 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'graphic-design': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'seo-optimization': 'https://images.unsplash.com/photo-1572177812156-58036aae439c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'digital-marketing': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'branding': 'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'video-editing': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    
    return service.imageUrl || 
           service.media?.thumbnail || 
           categoryImages[service.category] || 
           'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const applicationData = {
          serviceId: id,
          projectName: formData.projectName,
          description: formData.description,
          budget: parseFloat(formData.budget),
          deadline: formData.deadline,
          additionalInfo: formData.additionalInfo,
          // Note: File upload would need additional implementation
        };

        const response = await serviceService.applyForService(applicationData);
        
        if (response.success) {
          toast.success('Application submitted successfully!');
          navigate('/dashboard/projects');
        } else {
          toast.error(response.message || 'Failed to submit application');
        }
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error('Error submitting application. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading service details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="px-4 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Apply for {service.name || service.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Fill out the form below to request this service. Our team will review your application and get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Details */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img 
              src={getServiceImage(service)} 
              alt={service.name || service.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {service.name || service.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
              
              {/* Display features */}
              {service.features && service.features.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Includes:</h3>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Display pricing */}
              <div className="text-gray-900 dark:text-white font-medium">
                {service.pricing && service.pricing.packages && service.pricing.packages.length > 0 ? (
                  <span>From ${Math.min(...service.pricing.packages.map(p => p.price))}</span>
                ) : service.pricing && service.pricing.basePrice ? (
                  <span>From ${service.pricing.basePrice}</span>
                ) : (
                  <span>Contact for pricing</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    formErrors.projectName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Give your project a name"
                  maxLength="200"
                />
                <div className="flex justify-between mt-1">
                  <div>
                    {formErrors.projectName && (
                      <p className="text-sm text-red-600 dark:text-red-400">{formErrors.projectName}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.projectName.length}/200
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-2 rounded-md border ${
                    formErrors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Describe your project goals and requirements"
                  maxLength="2000"
                />
                <div className="flex justify-between mt-1">
                  <div>
                    {formErrors.description && (
                      <p className="text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.description.length}/2000
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget (USD) *
                  </label>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-md border ${
                      formErrors.budget ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="Your budget"
                  />
                  {formErrors.budget && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.budget}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 rounded-md border ${
                      formErrors.deadline ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                  {formErrors.deadline && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.deadline}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any other details you'd like to share"
                  maxLength="1000"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {formData.additionalInfo.length}/1000
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Attach Files (optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="files"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, PNG, JPG (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="files"
                      name="files"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formData.files.length} file(s) selected
                    </p>
                    <ul className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formData.files.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/services')}
                  className="mr-4 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientApplyService;
