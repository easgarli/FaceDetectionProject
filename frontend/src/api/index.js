const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

const apiCall = async (endpoint, options = {}) => {
    try {
        const headers = options.body instanceof FormData
            ? options.headers
            : { ...API_HEADERS, ...options.headers };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API call failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

export const photoAPI = {
    getAllPhotos: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/photos`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        return response.json();
    },
    getAllLabels: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/labels`);
        if (!response.ok) throw new Error('Failed to fetch labels');
        return response.json();
    },
    uploadPhotos: async (formData) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload photos');
        return response.json();
    },
    updateLabel: async (oldLabel, newLabel) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/update-label`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oldLabel, newLabel }),
        });
        if (!response.ok) throw new Error('Failed to update label');
        return response.json();
    }
};

export const labelAPI = {
    getAllLabels: () => apiCall('/labels'),

    getPhotosByLabel: (label) => apiCall(`/photos/${encodeURIComponent(label)}`),

    updatePersonName: (oldName, newName) => apiCall('/labels/update', {
        method: 'PUT',
        body: JSON.stringify({ oldName, newName }),
    }),
};

export const systemAPI = {
    checkHealth: () => apiCall('/health'),
};

export const handleApiError = (error) => {
    if (error instanceof TypeError) {
        console.error('Network Error:', error);
        return {
            type: 'NETWORK_ERROR',
            message: 'Unable to connect to the server. Please check your internet connection.'
        };
    }

    if (error.response) {
        console.error('Server Error:', error.response);
        return {
            type: 'SERVER_ERROR',
            message: error.response.message || 'Server error occurred',
            status: error.response.status,
            details: error.response.data
        };
    }

    if (error instanceof Error) {
        console.error('Application Error:', error);
        return {
            type: 'APP_ERROR',
            message: error.message
        };
    }

    console.error('Unknown Error:', error);
    return {
        type: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
    };
};