import api from './api';

export const serviceService = {
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  applyForService: async (serviceData) => {
    console.log('🔍 Frontend - Input serviceData:', serviceData);
    
    const today = new Date();
    const deadline = new Date(serviceData.deadline);
    
    console.log('📅 Frontend - Date validation:', {
      today: today.toISOString(),
      deadline: deadline.toISOString(),
      isValidDeadline: deadline > today
    });
    
    // Ensure the deadline is valid and in the future
    if (deadline <= today) {
      throw new Error('Deadline must be in the future');
    }
    
    // Ensure start date is not after deadline
    if (today >= deadline) {
      throw new Error('Start date cannot be after or equal to deadline');
    }
    
    const requestPayload = {
      service: serviceData.serviceId,
      title: serviceData.projectName,
      description: serviceData.description,
      budget: {
        amount: parseFloat(serviceData.budget),
        currency: 'USD'
      },
      timeline: {
        preferredStartDate: today.toISOString(),
        expectedDeliveryDate: deadline.toISOString()
      },
      requirements: serviceData.additionalInfo || ''
    };
    
    console.log('📤 Frontend - Request payload being sent:', JSON.stringify(requestPayload, null, 2));
    console.log('🔍 Frontend - Payload validation:');
    console.log('  - service (should be MongoDB ObjectId):', requestPayload.service);
    console.log('  - title length:', requestPayload.title?.length);
    console.log('  - description length:', requestPayload.description?.length);
    console.log('  - budget amount type:', typeof requestPayload.budget.amount);
    console.log('  - timeline dates valid:', {
      start: !isNaN(new Date(requestPayload.timeline.preferredStartDate)),
      end: !isNaN(new Date(requestPayload.timeline.expectedDeliveryDate))
    });
    
    const response = await api.post('/client/request-service', requestPayload);
    return response.data;
  },
  
  getMyProjects: async () => {
    // Try multiple possible endpoints in order to support different backend APIs
    const candidates = [
      '/services/my-projects',
      '/client/projects',
      '/service-requests',
      '/projects/my'
    ];

    for (const path of candidates) {
      try {
        const res = await api.get(path);
        if (res && res.data) return res.data;
      } catch (err) {
        // ignore and try next
      }
    }

    // As a last resort return an empty array shape
    return { projects: [] };
  },
  
  getProjectById: async (id) => {
    const response = await api.get(`/services/projects/${id}`);
    return response.data;
  }
};
