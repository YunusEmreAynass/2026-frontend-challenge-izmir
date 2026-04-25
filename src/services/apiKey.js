import axios from 'axios';

// Örnek Axios Instance
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor (Örneğin her isteğe Auth Token eklemek için)
apiClient.interceptors.request.use(
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

// Response Interceptor (Örneğin 401 hatası dönünce kullanıcıyı login'e atmak için)
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Oturum süresi doldu!');
            // Auth sıfırlama işlemleri...
        }
        return Promise.reject(error);
    }
);
