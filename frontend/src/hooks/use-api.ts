import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface FetchOptions extends RequestInit {
  data?: any;
}

export function useApi() {
  const { getToken } = useAuth();

  const customFetch = useCallback(async (endpoint: string, options: FetchOptions = {}) => {
    const token = await getToken();
    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.data) {
      headers.set("Content-Type", "application/json");
      options.body = JSON.stringify(options.data);
    }

    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }, [getToken]);

  return {
    get: (endpoint: string, options?: Omit<FetchOptions, "method">) => customFetch(endpoint, { ...options, method: "GET" }),
    post: (endpoint: string, data?: any, options?: Omit<FetchOptions, "method" | "data">) => customFetch(endpoint, { ...options, method: "POST", data }),
    put: (endpoint: string, data?: any, options?: Omit<FetchOptions, "method" | "data">) => customFetch(endpoint, { ...options, method: "PUT", data }),
    del: (endpoint: string, options?: Omit<FetchOptions, "method">) => customFetch(endpoint, { ...options, method: "DELETE" }),
  };
}
