import axios from 'axios';

// Jotform API Instance
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'https://api.jotform.com',
    timeout: 15000,
});

// Request Interceptor: Her isteğe API Key ekleme
apiClient.interceptors.request.use(
    (config) => {
        // Fallback directly to the key if VITE_API_KEY is not immediately available
        const apiKey = import.meta.env.VITE_API_KEY || 'b119f8e8fd7fe6fbdb3aa032cef23299';

        // Jotform API requires the API key exactly as a query parameter (apiKey)
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

