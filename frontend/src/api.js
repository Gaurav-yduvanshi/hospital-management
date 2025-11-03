import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

// Set up axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const authAPI = {
  userSignup: (data) => axios.post('/auth/user/signup', data),
  userLogin: (data) => axios.post('/auth/user/login', data),
  adminSignup: (data) => axios.post('/auth/admin/signup', data),
  adminLogin: (data) => axios.post('/auth/admin/login', data),
  hospitalSignup: (data) => axios.post('/auth/hospital/signup', data),
  hospitalLogin: (data) => axios.post('/auth/hospital/login', data),
};

// User APIs
export const userAPI = {
  searchHospitals: (params) => axios.get('/users/search-hospitals', { params }),
  searchNonSurgery: (params) => axios.get('/users/search-non-surgery', { params }),
  getHospital: (id) => axios.get(`/users/hospitals/${id}`),
  bookAppointment: (data) => axios.post('/users/book-appointment', data),
  getMyAppointments: () => axios.get('/users/my-appointments'),
};

// Hospital APIs
export const hospitalAPI = {
  getProfile: () => axios.get('/hospitals/profile'),
  addSurgery: (data) => axios.post('/hospitals/surgeries', data),
  updateSurgery: (id, data) => axios.put(`/hospitals/surgeries/${id}`, data),
  deleteSurgery: (id) => axios.delete(`/hospitals/surgeries/${id}`),
  addHealthIssue: (data) => axios.post('/hospitals/health-issues', data),
  updateHealthIssue: (id, data) => axios.put(`/hospitals/health-issues/${id}`, data),
  deleteHealthIssue: (id) => axios.delete(`/hospitals/health-issues/${id}`),
  getPatients: (params) => axios.get('/hospitals/patients', { params }),
  getPatient: (id) => axios.get(`/hospitals/patients/${id}`),
  updateApproval: (id, data) => axios.patch(`/hospitals/patients/${id}/approval`, data),
  updateSurgeryStatus: (id, data) => axios.patch(`/hospitals/patients/${id}/surgery-status`, data),
  updatePatientComments: (id, data) => axios.patch(`/hospitals/patients/${id}/comments`, data),
};

// Admin APIs
export const adminAPI = {
  getHospitals: () => axios.get('/admin/hospitals'),
  getHospital: (id) => axios.get(`/admin/hospitals/${id}`),
  createHospital: (data) => axios.post('/admin/hospitals', data),
  updateHospital: (id, data) => axios.put(`/admin/hospitals/${id}`, data),
  deleteHospital: (id) => axios.delete(`/admin/hospitals/${id}`),
  getPatients: (params) => axios.get('/admin/patients', { params }),
  getPatient: (id) => axios.get(`/admin/patients/${id}`),
  getUsers: (params) => axios.get('/admin/users', { params }),
  getDashboardStats: () => axios.get('/admin/stats/dashboard'),
};

export default axios;
