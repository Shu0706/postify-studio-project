import api from './api';

export const employeeService = {
  getAssignedTasks: async () => {
    const response = await api.get('/employee/tasks');
    return response.data;
  },
  
  getTaskById: async (id) => {
    const response = await api.get(`/employee/tasks/${id}`);
    return response.data;
  },
  
  submitWork: async (id, workData) => {
    const formData = new FormData();
    
    // Append files if they exist
    if (workData.files) {
      for (let i = 0; i < workData.files.length; i++) {
        formData.append('files', workData.files[i]);
      }
    }
    
    // Append other data
    formData.append('comments', workData.comments);
    
    const response = await api.post(`/employee/tasks/${id}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/employee/profile', profileData);
    return response.data;
  }
};
