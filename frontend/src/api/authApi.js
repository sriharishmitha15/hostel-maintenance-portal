import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (studentData) => axiosClient.post('/auth/register', studentData),
  getProfile: () => axiosClient.get('/auth/me'),
};
