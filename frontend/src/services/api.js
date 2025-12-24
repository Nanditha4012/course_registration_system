import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),      // ADD THIS
  resendOTP: (data) => api.post('/auth/resend-otp', data)       // ADD THIS
};

// Course API
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  uploadFile: (courseId, formData) => api.post(`/courses/${courseId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (courseId, fileId) => api.delete(`/courses/${courseId}/files/${fileId}`)
};

// Enrollment API
export const enrollmentAPI = {
  getMyCourses: () => api.get('/enrollments/my-courses'),
  enroll: (courseId) => api.post(`/enrollments/enroll/${courseId}`),
  drop: (courseId) => api.delete(`/enrollments/drop/${courseId}`),

  listCourseStudents: (courseId) => api.get(`/enrollments/course/${courseId}/students`),
  exportCourseStudentsCSV: (courseId) => api.get(`/enrollments/course/${courseId}/students/export`, { responseType: 'blob' })
};


export default api;
