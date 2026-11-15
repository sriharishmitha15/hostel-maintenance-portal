import axiosClient from './axiosClient';

export const adminApi = {
  getAllComplaints: () => axiosClient.get('/admin/complaints'),

  assignComplaint: (complaintId, data) => 
    axiosClient.put(`/admin/complaints/${complaintId}/assign`, data),

  updateStatus: (complaintId, data) => 
    axiosClient.put(`/admin/complaints/${complaintId}/status`, data),

  getStaffMembers: () => axiosClient.get('/admin/staff'),

  getUsers: (role) => axiosClient.get('/admin/users', { params: { role } }),

  createStaff: (staffData) => axiosClient.post('/admin/users/staff', staffData),

  createCategory: (catData) => axiosClient.post('/admin/categories', catData),

  getAnalytics: () => axiosClient.get('/analytics/dashboard'),
};
