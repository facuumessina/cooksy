import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tu-api.com', // Reemplazá por tu URL real
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
