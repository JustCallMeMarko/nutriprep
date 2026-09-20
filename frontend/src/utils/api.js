import { useAuth } from "@clerk/react";
import { useCallback } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const parseResponse = async (response) => {
    const body = await response.text();
    if (!body) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return body;

    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
};

const getErrorMessage = (response, data) => {
    if (response.status === 401) return "Your session has expired. Please sign in again.";
    if (response.status === 429) return "Credit limit exceeded";
    if (typeof data === "string" && data.trim()) return data;
    return data?.detail || data?.message || data?.error || response.statusText || "An error occurred";
};

export const useApi = () => {
    const { getToken } = useAuth();

    const makeRequest = useCallback(async (endpoint, options = {}) => {
        const { signal: providedSignal, ...requestOptions } = options;
        const controller = new AbortController();
        const token = await getToken();
        const headers = new Headers({
            Accept: "application/json",
            "Content-Type": "application/json",
        });

        new Headers(requestOptions.headers).forEach((value, key) => headers.set(key, value));
        if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint.replace(/^\//, "")}`, {
                ...requestOptions,
                headers,
                signal: providedSignal || controller.signal,
            });
            const data = await parseResponse(response);

            if (!response.ok) {
                const error = new Error(getErrorMessage(response, data));
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            if (error.name === "AbortError") throw new Error("Request was cancelled");
            if (error instanceof TypeError) {
                throw new Error("Unable to reach the server. Please check your connection.");
            }
            throw error;
        }
    }, [getToken]);

    return { makeRequest };
};