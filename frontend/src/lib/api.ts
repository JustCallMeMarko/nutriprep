import { useAuth } from "@clerk/react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = async (endpoint: string, options = {}) => {
        const token = await getToken();
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail || 'An error occurred while making the API request.');
        }

        return response.json();
    }
    return { makeRequest };
}