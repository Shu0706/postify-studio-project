import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiClock,
  FiTag,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import ServiceModal from '../../components/admin/ServiceModal';

// Service Management Component

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'social-media-management', label: 'Social Media Management' },
    { value: 'content-writing', label: 'Content Writing' },
    { value: 'graphic-design', label: 'Graphic Design' },
    { value: 'seo-optimization', label: 'SEO Optimization' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'branding', label: 'Branding' },
    { value: 'video-editing', label: 'Video Editing' }
  ];

  function getInitialFormData() {
    return {
      name: '',
      description: '',
      category: '',
      pricing: {
        type: 'package',
        basePrice: 0,
        currency: 'USD',
        packages: [
          {
            name: '',
            description: '',
            price: 0,
            features: [''],
            deliveryTime: 7
          }
        ]
      },
      features: [''],
      requirements: [''],
      deliverables: [''],
      estimatedDeliveryTime: 7,
      tags: [''],
      isActive: true
    };
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, service = null) => {
    setModalMode(mode);
    setSelectedService(service);
    
    if (mode === 'add') {
      setFormData(getInitialFormData());
    } else if (service) {
      setFormData({
        ...service,
        features: service.features || [''],
        requirements: service.requirements || [''],
        deliverables: service.deliverables || [''],
        tags: service.tags || ['']
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData(getInitialFormData());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Clean up form data
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        deliverables: formData.deliverables.filter(d => d.trim()),
        tags: formData.tags.filter(t => t.trim())
      };

      if (modalMode === 'add') {
        await adminService.createService(cleanedData);
        toast.success('Service created successfully!');
      } else if (modalMode === 'edit') {
        await adminService.updateService(selectedService._id, cleanedData);
        toast.success('Service updated successfully!');
      }
      
      await fetchServices();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await adminService.deleteService(serviceId);
      toast.success('Service deleted successfully!');
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleToggleActive = async (serviceId, currentStatus) => {
    try {
      await adminService.updateService(serviceId, { isActive: !currentStatus });
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchServices();
    } catch (error) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addPackage = () => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        packages: [
          ...prev.pricing.packages,
          {
            name: '',
            description: '',
            price: 0,
            features: [''],
            deliveryTime: 7
          }
        ]
      }
    }));
  };

  const removePackage = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        packages: prev.pricing.packages.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePackage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        packages: prev.pricing.packages.map((pkg, i) => 
          i === index ? { ...pkg, [field]: value } : pkg
        )
      }
    }));
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Management</h1>
          <p className="text-gray-600">Manage your service offerings and packages</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Service Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenModal('add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus size={20} />
              Add Service
            </motion.button>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Service Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiTag size={16} />
                        <span className="capitalize">{service.category.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiDollarSign size={16} />
                        <span>From ${service.pricing.basePrice}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock size={16} />
                        <span>{service.estimatedDeliveryTime} days</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal('view', service)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FiEye size={16} />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal('edit', service)}
                        className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(service._id)}
                        className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <FiTrash2 size={16} />
                      </motion.button>
                    </div>

                    {/* Toggle Active Status */}
                    <button
                      onClick={() => handleToggleActive(service._id, service.isActive)}
                      className={`w-full mt-3 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        service.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No Services Message */}
        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first service.'}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <button
                onClick={() => handleOpenModal('add')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Service
              </button>
            )}
          </div>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        showModal={showModal}
        modalMode={modalMode}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleCloseModal={handleCloseModal}
        addArrayField={addArrayField}
        removeArrayField={removeArrayField}
        updateArrayField={updateArrayField}
        addPackage={addPackage}
        removePackage={removePackage}
        updatePackage={updatePackage}
      />
    </div>
  );
};

export default ServiceManagement;
