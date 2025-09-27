import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: '13.236.85.224:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;

// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:5001', // Your backend URL
// });

// // Use an interceptor to add the token to every request
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the token directly from localStorage by its key
//     const token = localStorage.getItem('token');

//     if (token) {
//       // If a token exists, add it to the Authorization header
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
