import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { serviceService } from '../../services/serviceService';
import { toast } from 'react-toastify';

const ClientServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getAllServices();
        console.log('Services API response:', response);
        if (response.success) {
          // The services are in response.data.services based on backend controller
          setServices(response.data.services || response.data);
        } else {
          toast.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Error loading services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on category
  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    return service.category === filter;
  });

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

  // Search services
  const searchedServices = filteredServices.filter(service => {
    const serviceName = service.name || service.title || '';
    return serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           service.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Our Services</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Explore our range of services designed to help your business thrive in the digital world.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setFilter('web-development')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'web-development'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Web Development
            </button>
            <button
              onClick={() => setFilter('social-media-management')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'social-media-management'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Social Media
            </button>
            <button
              onClick={() => setFilter('content-writing')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'content-writing'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Content Writing
            </button>
            <button
              onClick={() => setFilter('graphic-design')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'graphic-design'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Graphic Design
            </button>
            <button
              onClick={() => setFilter('seo-optimization')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'seo-optimization'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              SEO
            </button>
            <button
              onClick={() => setFilter('digital-marketing')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'digital-marketing'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Digital Marketing
            </button>
            <button
              onClick={() => setFilter('branding')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                filter === 'branding'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Branding
            </button>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading services...</p>
        </div>
      ) : searchedServices.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">No services found. Try changing your filters.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {searchedServices.map((service) => (
            <motion.div 
              key={service._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <img 
                src={getServiceImage(service)} 
                alt={service.name || service.title} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {service.name || service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{service.description}</p>
                
                {/* Display packages if available */}
                {service.pricing && service.pricing.packages && service.pricing.packages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Packages:</h4>
                    <div className="space-y-2">
                      {service.pricing.packages.slice(0, 2).map((pkg, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{pkg.name}:</span>
                          <span className="text-primary ml-1">${pkg.price}</span>
                        </div>
                      ))}
                      {service.pricing.packages.length > 2 && (
                        <p className="text-xs text-gray-500">+{service.pricing.packages.length - 2} more packages</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Display features if available */}
                {service.features && service.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                          <svg className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-gray-500 ml-6">+{service.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {service.pricing && service.pricing.packages && service.pricing.packages.length > 0 ? (
                      <span>From ${Math.min(...service.pricing.packages.map(p => p.price))}</span>
                    ) : service.pricing && service.pricing.basePrice ? (
                      <span>From ${service.pricing.basePrice}</span>
                    ) : (
                      <span>Contact for pricing</span>
                    )}
                  </div>
                  <Link
                    to={`/dashboard/services/apply/${service._id}`}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ClientServices;
