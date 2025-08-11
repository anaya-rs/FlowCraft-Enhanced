import { useState } from "react";
import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://localhost:8000/api/v1";

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    const type = localStorage.getItem("tokenType") || "bearer";
    return token ? { Authorization: `${type} ${token}` } : {};
  }

  async function request<T = any>(method: string, url: string, data?: any, config?: AxiosRequestConfig): Promise<T | null> {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios({
        method,
        url: API_BASE + url,
        data,
        headers: {
          ...getAuthHeaders(),
          ...(config?.headers || {}),
        },
        ...config,
      });
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail || "API error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    get: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>("get", url, undefined, config),
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>("post", url, data, config),
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => request<T>("put", url, data, config),
    del: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>("delete", url, undefined, config),
    error,
  };
}
