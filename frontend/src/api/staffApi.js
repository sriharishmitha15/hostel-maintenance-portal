import axiosClient from './axiosClient';

export const staffApi = {
  getTasks: (params = {}) => axiosClient.get('/staff/tasks', { params }),

  updateTaskStatus: (complaintId, formData) => {
    return axiosClient.put(`/staff/tasks/${complaintId}/status`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
