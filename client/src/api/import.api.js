import api from './axios';

/**
 * Upload candidate CSV file to the bulk import endpoint
 * @param {File} file The CSV file object
 * @param {Function} onUploadProgress Callback to report upload completion percentage
 * @returns {Promise<Object>} Import summary report
 */
export const importCSV = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/candidates/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};
