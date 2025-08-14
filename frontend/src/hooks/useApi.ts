import { useState } from "react";
import axios, { AxiosRequestConfig } from "axios";
import authService from "../services/authService";

const API_BASE = "http://localhost:8000/api/v1";

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function getAuthHeaders() {
      const token = localStorage.getItem("access_token");
  const type = "Bearer";
    return token ? { Authorization: `${type} ${token}` } : {};
  }

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    timeout: 30000,
  })

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired, logout but don't redirect
        authService.logout()
        // Don't use window.location.href - let the App component handle navigation
      }
      return Promise.reject(error)
    }
  )

  return api
}
