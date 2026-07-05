import api from './axios';

/**
 * Retrieve candidates list (supports search, filters, pagination, and sorting via query params)
 * @param {Object} params 
 * @returns {Promise<Object>} Paginated candidates payload
 */
export const listCandidates = async (params = {}) => {
  const response = await api.get('/candidates', { params });
  return response.data;
};

/**
 * Retrieve single candidate by ID
 * @param {String} id 
 * @returns {Promise<Object>} Candidate profile
 */
export const getCandidateById = async (id) => {
  const response = await api.get(`/candidates/${id}`);
  return response.data;
};

/**
 * Create a new candidate record
 * @param {Object} data 
 * @returns {Promise<Object>} Created candidate
 */
export const createCandidate = async (data) => {
  const response = await api.post('/candidates', data);
  return response.data;
};

/**
 * Update candidate details / status
 * @param {String} id 
 * @param {Object} data 
 * @returns {Promise<Object>} Updated candidate
 */
export const updateCandidate = async (id, data) => {
  const response = await api.put(`/candidates/${id}`, data);
  return response.data;
};

/**
 * Delete a candidate profile
 * @param {String} id 
 * @returns {Promise<Object>} Confirmation payload
 */
export const deleteCandidate = async (id) => {
  const response = await api.delete(`/candidates/${id}`);
  return response.data;
};
