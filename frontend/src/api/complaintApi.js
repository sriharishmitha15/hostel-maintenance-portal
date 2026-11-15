import axiosClient from './axiosClient';

export const complaintApi = {
  getCategories: () => axiosClient.get('/complaints/categories'),

  getComplaints: (params = {}) => axiosClient.get('/complaints', { params }),

  getComplaintById: (id) => axiosClient.get(`/complaints/${id}`),

  submitComplaint: (formData) => {
    return axiosClient.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
