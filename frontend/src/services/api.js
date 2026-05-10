import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token to headers
api.interceptors.request.use(
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

// Response interceptor to handle 401 errors (logout)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - Logging out');
      console.log('Error details:', error.response.data);
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  register: (username, password, role) => 
    api.post('/auth/register', { username, password, role }),
};

// Teachers API methods
export const teachersAPI = {
  getAll: () => 
    api.get('/teachers'),
  
  create: (teacherData) =>
    api.post('/teachers', teacherData),
  
  getFree: (date, period, day) => 
    api.get('/teachers/free', { params: { date, period, day } }),
};

// Timetable API methods
export const timetableAPI = {
  getAll: (params) => 
    api.get('/timetable', { params }),
  
  import: (xmlData) => 
    api.post('/timetable/import', { xmlData }),
  
  deleteAll: () =>
    api.delete('/timetable'),
};

// Attendance API methods
export const attendanceAPI = {
  create: (teacherId, date, status) => 
    api.post('/attendance', { teacherId, date, status }),
  
  markPeriodAttendance: (teacherId, date, absentPeriods) =>
    api.post('/attendance/periods', { teacherId, date, absentPeriods }),
  
  getScheduleWithAttendance: (teacherId, date) =>
    api.get(`/attendance/schedule/${teacherId}/${date}`),
  
  getAll: (params) => 
    api.get('/attendance', { params }),
};

// Substitutions API methods
export const substitutionsAPI = {
  create: (absentTeacherId, substituteTeacherId, date, period, className, subject) => 
    api.post('/substitutions', { 
      absentTeacherId, 
      substituteTeacherId, 
      date, 
      period, 
      class: className, 
      subject 
    }),
  
  getAll: (params) => 
    api.get('/substitutions', { params }),
  
  update: (id, data) => 
    api.put(`/substitutions/${id}`, data),
  
  getCoverage: (teacherId, date) => 
    api.get(`/substitutions/coverage/${teacherId}/${date}`),
};

export default api;
