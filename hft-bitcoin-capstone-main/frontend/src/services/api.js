import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Backend'in çalıştığı URL
});

export const fetchPrediction = async () => {
  try {
    const response = await api.get('/predict');
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
