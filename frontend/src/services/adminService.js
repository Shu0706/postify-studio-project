import CacheableService from './CacheableService';

class AdminService extends CacheableService {
  constructor() {
    super('/admin');
  }

  // Dashboard
  async getDashboard() {
    return this.get('/dashboard', {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }

  // Client Management
  async getAllClients() {
    return this.get('/clients', {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }

  async getClients(params = {}) {
    return this.get('/clients', params, { 
      useCache: true, 
      ttl: 2 * 60 * 1000  // Cache for 2 minutes
    });
  }
  
  async getClientById(id) {
    return this.get(`/clients/${id}`, {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }
  
  async createClient(clientData) {
    return this.post('/clients', clientData, {
      invalidateCache: [
        this.getCacheKey('/clients'),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  async deleteClient(id) {
    return this.delete(`/clients/${id}`, {}, {
      invalidateCache: [this.getCacheKey('/clients')],
    });
  }
  
  // Employee Management
  async getAllEmployees() {
    return this.get('/employees', {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }

  async getEmployees(params = {}) {
    return this.get('/employees', params, { 
      useCache: true, 
      ttl: 2 * 60 * 1000  // Cache for 2 minutes
    });
  }
  
  async getEmployeeById(id) {
    return this.get(`/employees/${id}`, {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }
  
  async createEmployee(employeeData) {
    return this.post('/employees', employeeData, {
      invalidateCache: [
        this.getCacheKey('/employees'),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  async addEmployee(employeeData) {
    return this.post('/employees', employeeData, {
      invalidateCache: [this.getCacheKey('/employees')],
    });
  }
  
  async updateEmployee(id, updates) {
    return this.put(`/employees/${id}`, updates, {
      invalidateCache: [
        this.getCacheKey('/employees'),
        this.getCacheKey(`/employees/${id}`),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  async deleteEmployee(id) {
    return this.delete(`/employees/${id}`, {}, {
      invalidateCache: [this.getCacheKey('/employees')],
    });
  }

  // Service Requests Management
  async getServiceRequests(params = {}) {
    return this.get('/service-requests', params, { 
      useCache: true, 
      ttl: 1 * 60 * 1000  // Cache for 1 minute
    });
  }
  
  async getServiceRequestById(id) {
    return this.get(`/service-requests/${id}`, {}, { 
      useCache: true, 
      ttl: 2 * 60 * 1000  // Cache for 2 minutes
    });
  }
  
  async updateServiceRequestStatus(id, statusData) {
    return this.put(`/service-requests/${id}/status`, statusData, {
      invalidateCache: [
        this.getCacheKey('/service-requests'),
        this.getCacheKey(`/service-requests/${id}`),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  // Project Management
  async getAllProjects() {
    return this.get('/projects', {}, { 
      useCache: true, 
      ttl: 2 * 60 * 1000  // Cache for 2 minutes
    });
  }
  
  async assignTask(taskData) {
    return this.post('/tasks/assign', taskData, {
      invalidateCache: [
        this.getCacheKey('/projects'),
        this.getCacheKey('/tasks')
      ],
    });
  }
  
  async approveWork(id) {
    return this.put(`/projects/${id}/approve`, {}, {
      invalidateCache: [
        this.getCacheKey('/projects'),
        this.getCacheKey(`/projects/${id}`)
      ],
    });
  }
  
  async rejectWork(id, feedback) {
    return this.put(`/projects/${id}/reject`, { feedback }, {
      invalidateCache: [
        this.getCacheKey('/projects'),
        this.getCacheKey(`/projects/${id}`)
      ],
    });
  }
  
  // Analytics
  async getAnalytics(period = '30d') {
    return this.get(`/analytics`, { period }, { 
      useCache: true, 
      ttl: 15 * 60 * 1000  // Cache for 15 minutes
    });
  }
  
  // Notifications
  async getNotifications() {
    return this.get('/notifications', {}, { 
      useCache: true, 
      ttl: 1 * 60 * 1000  // Cache for 1 minute
    });
  }
  
  async markNotificationAsRead(id) {
    return this.put(`/notifications/${id}/read`, {}, {
      invalidateCache: [this.getCacheKey('/notifications')],
    });
  }

  // Service Management
  async getAllServices() {
    return this.get('/services', {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }
  
  async getServiceById(id) {
    return this.get(`/services/${id}`, {}, { 
      useCache: true, 
      ttl: 5 * 60 * 1000  // Cache for 5 minutes
    });
  }
  
  async createService(serviceData) {
    return this.post('/services', serviceData, {
      invalidateCache: [
        this.getCacheKey('/services'),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  async updateService(id, serviceData) {
    return this.put(`/services/${id}`, serviceData, {
      invalidateCache: [
        this.getCacheKey('/services'),
        this.getCacheKey(`/services/${id}`),
        this.getCacheKey('/dashboard')
      ],
    });
  }
  
  async deleteService(id) {
    return this.delete(`/services/${id}`, {}, {
      invalidateCache: [
        this.getCacheKey('/services'),
        this.getCacheKey('/dashboard')
      ],
    });
  }
}

export const adminService = new AdminService();
export default adminService;
