import api from './axios';

/**
 * Log in a user
 * @param {String} email 
 * @param {String} password 
 * @returns {Promise<Object>} User details and token
 */
export const login = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

/**
 * Register a new user
 * @param {String} name 
 * @param {String} email 
 * @param {String} password 
 * @param {String} role 
 * @returns {Promise<Object>} Registered user details and token
 */
export const register = async (name, email, password, role) => {
  const response = await api.post('/users/register', { name, email, password, role });
  return response.data;
};
