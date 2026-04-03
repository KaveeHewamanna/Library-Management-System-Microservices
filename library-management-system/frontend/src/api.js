import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('library_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const fetchBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

export const fetchReservationsByUser = async (userId) => {
  const response = await api.get(`/reservations/user/${userId}`);
  return response.data;
};

export const reserveBook = async (userId, bookId, notes) => {
  const response = await api.post('/reservations', { userId, bookId, notes });
  return response.data;
};

export const issueBorrow = async (userId, bookId) => {
  const response = await api.post('/borrows', { userId, bookId });
  return response.data;
};

// ==========================================
// Administration / Librarian Endpoints
// ==========================================

export const addBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

export const deleteBook = async (bookId) => {
  const response = await api.delete(`/books/${bookId}`);
  return response.data;
};

export const updateBook = async (bookId, bookData) => {
  const response = await api.put(`/books/${bookId}`, bookData);
  return response.data;
};

export const fetchAllReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

export const fetchAllBorrows = async () => {
  const response = await api.get('/borrows');
  return response.data;
};

export const returnBook = async (borrowId) => {
  const response = await api.put(`/borrows/${borrowId}/return`);
  return response.data;
};

export const fetchAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export default api;
