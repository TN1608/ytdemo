import axios from 'axios';

const apiKey = process.env.NEXT_PUBLIC_API_KEY;

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    params: {
        key: apiKey,
    },
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động thêm header Authorization
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        if (token) {
            config.headers.Authorization = `${token}`; // Thêm token vào header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default api;