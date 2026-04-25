import axios from 'axios';

// Jotform API Instance
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'https://api.jotform.com',
    timeout: 15000,
});

// Request Interceptor: Her isteğe API Key ekleme
apiClient.interceptors.request.use(
    (config) => {
        const apiKey = import.meta.env.VITE_API_KEY;

        // Jotform API requires the API key as a query parameter
        if (apiKey) {
            config.params = config.params || {};
            config.params.apiKey = apiKey;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Jotform returns actual data inside response.data.content
        if (response.data && response.data.responseCode === 200) {
            return response.data.content;
        }
        return response.data;
    },
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

