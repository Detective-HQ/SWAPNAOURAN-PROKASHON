import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface FetchOptions extends RequestInit {
  data?: any;
}

export function useApi() {
  const { getToken } = useAuth();

  const customFetch = useCallback(async (endpoint: string, options: FetchOptions = {}) => {
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      // Public endpoints should still work even if auth token lookup is not ready.
      token = null;
    }
    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.data !== undefined) {
      if (options.data instanceof FormData) {
        options.body = options.data;
      } else {
        headers.set("Content-Type", "application/json");
        options.body = JSON.stringify(options.data);
      }
    }

    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const method = (options.method || "GET").toUpperCase();
    const response = await fetch(url, {
      ...options,
      // Prevent conditional-cache 304 responses for API calls,
      // which would otherwise be treated as errors by response.ok checks.
      cache: options.cache ?? (method === "GET" ? "no-store" : undefined),
      headers,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const validationDetails = Array.isArray(data?.errors)
        ? data.errors.map((issue: any) => `${issue.path}: ${issue.message}`).join(", ")
        : "";
      const message = data?.message || "Something went wrong";
      throw new Error(validationDetails ? `${message} (${validationDetails})` : message);
    }

    return data;
  }, [getToken]);

  return useMemo(() => ({
    get: (endpoint: string, options?: Omit<FetchOptions, "method">) => customFetch(endpoint, { ...options, method: "GET" }),
    post: (endpoint: string, data?: any, options?: Omit<FetchOptions, "method" | "data">) => customFetch(endpoint, { ...options, method: "POST", data }),
    put: (endpoint: string, data?: any, options?: Omit<FetchOptions, "method" | "data">) => customFetch(endpoint, { ...options, method: "PUT", data }),
    del: (endpoint: string, options?: Omit<FetchOptions, "method">) => customFetch(endpoint, { ...options, method: "DELETE" }),
  }), [customFetch]);
}
