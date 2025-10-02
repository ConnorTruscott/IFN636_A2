import axios from 'axios';
const baseURL = process.env.REACT_APP_API_URL || axios.baseURL;
const http = axios.create({ baseURL });
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default http;
