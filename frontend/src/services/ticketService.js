
import axios from 'axios';
import authService from './authService'; 

const API_URL = "http://localhost:8000/api/tickets/";
const BASE_URL = "http://localhost:8000"; 


const api = axios.create();

api.interceptors.request.use(
  config => {
    const token = authService.getToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);




const getAllTickets = (searchTerm, selectedCategory) => {
  //  query parameters
  const params = new URLSearchParams();
  if (searchTerm && searchTerm.trim() !== '') {
    params.append('search', searchTerm.trim());
  }
  
  if (selectedCategory && selectedCategory !== 'All Categories') {
    params.append('category', selectedCategory);
  }
  return api.get(API_URL, { params });
};


const createTicket = (formData) => {
  return api.post(API_URL, formData); 
};


const getTicket = (id) => {
  return api.get(API_URL + id); 
};

const updateTicket = (id, ticketData) => {
  return api.put(API_URL + id, ticketData); 
};

const deleteTicket = (id) => {
  return api.delete(API_URL + id); 
};

export default {
  getAllTickets,
  createTicket, 
  getTicket,
  updateTicket,
  deleteTicket,
  BASE_URL 
};