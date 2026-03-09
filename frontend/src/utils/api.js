import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (email, password) => API.post('/api/auth/login', { email, password }),
  adminLogin: (email, password) => API.post('/api/auth/admin-login', { email, password }),
  getProfile: () => API.get('/api/auth/profile'),
  updateProfile: (data) => API.put('/api/auth/profile', data)
};

// Book APIs
export const bookAPI = {
  getAllBooks: (page, limit, category, search) =>
    API.get('/api/books', { params: { page, limit, category, search } }),
  getBookById: (id) => API.get(`/api/books/${id}`),
  searchBooks: (q) => API.get('/api/books/search', { params: { q } }),
  addBook: (data) => API.post('/api/books', data),
  updateBook: (id, data) => API.put(`/api/books/${id}`, data),
  deleteBook: (id) => API.delete(`/api/books/${id}`),
  getCategories: () => API.get('/api/books/categories'),
  addCategory: (data) => API.post('/api/books/categories/add', data)
};

// Issue APIs
export const issueAPI = {
  issueBook: (bookId) => API.post('/api/issues/issue', { bookId }),
  returnBook: (issueId) => API.post('/api/issues/return', { issueId }),
  renewBook: (issueId) => API.post('/api/issues/renew', { issueId }),
  getUserHistory: () => API.get('/api/issues/history'),
  getActiveIssues: () => API.get('/api/issues/active'),
  getOverdueBooks: () => API.get('/api/issues/overdue'),
  staffIssue: (userId, bookId) => API.post('/api/issues/staff-issue', { userId, bookId })
};

// Fine APIs
export const fineAPI = {
  getFines: () => API.get('/api/fines'),
  getUserTotalFines: () => API.get('/api/fines/user-total'),
  getPolicy: () => API.get('/api/fines/policy'),
  payFine: (fineId, paymentMethod) => API.post('/api/fines/pay', { fineId, paymentMethod }),
  getFineExplanation: (fineId) => API.get(`/api/fines/${fineId}/explanation`),
  getAllFines: (page, limit, status) =>
    API.get('/api/fines/all', { params: { page, limit, status } }),
  waiveFine: (fineId, reason) => API.post('/api/fines/waive', { fineId, reason })
};

// Reservation APIs
export const reservationAPI = {
  reserveBook: (bookId) => API.post('/api/reservations', { bookId }),
  getUserReservations: () => API.get('/api/reservations'),
  cancelReservation: (reservationId, reason) =>
    API.post('/api/reservations/cancel', { reservationId, reason }),
  getAllReservations: (page, limit, status) =>
    API.get('/api/reservations/all', { params: { page, limit, status } }),
  getReservationQueue: (bookId) => API.get(`/api/reservations/queue/${bookId}`),
  approveReservation: (reservationId) =>
    API.post('/api/reservations/approve', { reservationId }),
  markReservationReady: (reservationId) =>
    API.post('/api/reservations/mark-ready', { reservationId })
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => API.get('/api/admin/dashboard/stats'),
  getFinePolicyConfig: () => API.get('/api/admin/fine-policy'),
  updateFinePolicy: (data) => API.put('/api/admin/fine-policy', data),
  getUserManagement: (page, limit, role, status) =>
    API.get('/api/admin/users', { params: { page, limit, role, status } }),
  updateUserStatus: (userId, status) =>
    API.put(`/api/admin/users/${userId}/status`, { status }),
  deleteUser: (userId) => API.delete(`/api/admin/users/${userId}`),
  getSystemAnalytics: () => API.get('/api/admin/analytics'),
  getAuditLogs: (page, limit) => API.get('/api/admin/audit-logs', { params: { page, limit } }),
  getDemandForecast: (categoryId) => API.get(`/api/admin/demand-forecast/${categoryId}`)
};

// User APIs
export const userAPI = {
  getNotifications: () => API.get('/api/user/notifications'),
  markNotificationAsRead: (notificationId) =>
    API.post('/api/user/notifications/read', { notificationId }),
  getBorrowingHistory: () => API.get('/api/user/borrowing-history'),
  getAIBorrowingSummary: () => API.get('/api/user/borrowing-summary'),
  getPersonalizedInsights: () => API.get('/api/user/personalized-insights'),
  getReadingHabits: () => API.get('/api/user/reading-habits')
};

export default API;
