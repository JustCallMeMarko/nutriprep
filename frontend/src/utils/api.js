import { useAuth } from "@clerk/react";
import { useCallback } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = useCallback(async (endpoint, options = {}) => {
        const token = await getToken();
        const headers = new Headers(options.headers);
        headers.set("Content-Type", "application/json");
        if (token) headers.set("Authorization", `Bearer ${token}`);

        const response = await fetch(`${API_BASE_URL}/${endpoint.replace(/^\//, "")}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status === 429) throw new Error("Credit limit exceeded");
            throw new Error(errorData?.detail || "An error occurred");
        }

        if (response.status === 204) return null;
        return response.json();
    }, [getToken]);

    return { makeRequest };
};