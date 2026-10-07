import api from './axios';

export const jobService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getJob: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  applyForJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/apply`);
    return response.data;
  },

  startJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/start`);
    return response.data;
  },

  completeJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/complete`);
    return response.data;
  },

  cancelJob: async (jobId, reason) => {
    const response = await api.post(`/jobs/${jobId}/cancel`, { reason });
    return response.data;
  },

  getApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  assignDriver: async (jobId, applicationId) => {
    const response = await api.post(`/jobs/${jobId}/assign/${applicationId}`);
    return response.data;
  },
};
