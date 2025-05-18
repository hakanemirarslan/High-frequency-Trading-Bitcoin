import axios from 'axios';

// Define API response types
interface PredictionResponse {
  price: number;
  prediction: string;
}

interface ChartResponse {
  chart: string;
}

// Create API instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
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

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Network error - no response received');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      throw new Error('Error setting up request');
    }
  }
);

// Export typed API methods
export const fetchPrediction = async (): Promise<PredictionResponse> => {
  try {
    const response = await api.get('/predict');
    return response.data;
  } catch (error) {
    console.error('Prediction API Error:', error);
    throw error;
  }
};

export const fetchChart = async (): Promise<ChartResponse> => {
  try {
    const response = await api.get('/chart');
    return response.data;
  } catch (error) {
    console.error('Chart API Error:', error);
    throw error;
  }
};

export default api;

export const fetchPrediction = async () => {
  try {
    const response = await api.get('/predict');
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
