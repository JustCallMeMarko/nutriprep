import { useAuth } from "@clerk/react";

export const useApi = () => {
    const { getToken } = useAuth();
    const makeRequest = async (endpoint, options = {}) => {
        const token = await getToken();
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        const response = await fetch(`https://localhost:8000/${endpoint}`, { ...defaultOptions, 
            ...defaultOptions,
            ...options
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 429) {
                throw new Error('Credit limit exceeded');
            }
            throw new Error(errorData?.detail || 'An error occurred');
        }
        return response.json();
    }

    return { makeRequest };

}