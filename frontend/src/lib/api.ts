import { useCallback, useEffect, useRef } from "react"
import { useAuth, useUser } from "@clerk/react"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const useApi = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const role = user?.publicMetadata?.role

  // getToken isn't referentially stable across renders; routing it through a
  // ref keeps makeRequest stable so effects depending on it don't refire in a loop.
  const getTokenRef = useRef(getToken)
  useEffect(() => {
    getTokenRef.current = getToken
  })

  const makeRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!role) {
      throw new Error("Your account is still loading. Please try again.")
    }
    const token = await getTokenRef.current()
    const { headers: customHeaders, body, ...restOptions } = options
    const isFormData = body instanceof FormData
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(customHeaders as Record<string, string> | undefined),
    }

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(`${API_BASE_URL}/${role}/${endpoint}`, {
      body,
      headers,
      ...restOptions,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.detail || "An error occurred while making the API request.")
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }, [role])

  return { makeRequest }
}
