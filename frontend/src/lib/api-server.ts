import { auth } from "@clerk/nextjs/server";

const rawBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const BASE_URL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function serverApi(endpoint: string, options: FetchOptions = {}) {
  const { getToken } = await auth();
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
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" && data.trim() ? data : null) ||
      "Something went wrong server-side";
    const error = new Error(message) as Error & { status?: number; details?: unknown };
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}
