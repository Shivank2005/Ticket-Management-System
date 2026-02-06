
import axios from 'axios';
const AUTH_API_BASE_URL = "http://localhost:8000/api/"; 
const setAuthData = (token, username) => {
  localStorage.setItem('userToken', token);
  localStorage.setItem('username', username); 
};



const login = async (username_or_email, password) => {
  try {
    
    const formData = new URLSearchParams();
    formData.append('username', username_or_email);
    formData.append('password', password);

    // the POST request  login endpoint
    const response = await axios.post(AUTH_API_BASE_URL + 'login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
    });

    const token = response.data.access_token; 
    const loggedInUsername = username_or_email; 
    setAuthData(token, loggedInUsername); 

    return { username: loggedInUsername, token: token }; 
  } catch (error) {
    
    console.error('Backend Login Error:', error.response?.data || error.message);
    
    throw new Error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
  }
};

const register = async (username, email, password) => {
  try {
    
    const response = await axios.post(AUTH_API_BASE_URL + 'register', {
      username,
      email,
      password,
    });
  
    return response.data; 
  } catch (error) {
    console.error('Backend Registration Error:', error.response?.data || error.message);
    let errorMessage = 'Registration failed. ';
    if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
            errorMessage += error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
            
            errorMessage += error.response.data.detail.map(err => err.msg).join('; ');
        }
    } else {
        errorMessage += error.message;
    }
    throw new Error(errorMessage);
  }
};

const logout = () => {
  localStorage.removeItem('userToken'); 
  localStorage.removeItem('username'); 
  console.log("User logged out (client-side token cleared).");
  
};
const isAuthenticated = () => {
  const token = localStorage.getItem('userToken');
  
  return token !== null;
};


const getToken = () => {
  return localStorage.getItem('userToken');
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(AUTH_API_BASE_URL + 'forgot-password', { email });
    return response.data; 
  } catch (error) {
    console.error('Forgot Password Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to send reset link.');
  }
};

const resetPassword = async (token, new_password) => {
  try {
    const response = await axios.post(AUTH_API_BASE_URL + 'reset-password', { token, new_password });
    return response.data; 
  } catch (error) {
    console.error('Reset Password Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to reset password.');
  }
};


export default {
  login,
  register,
  logout,
  isAuthenticated,
  getToken,
  forgotPassword, 
  resetPassword,  
};

