import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { supabase } from "@/lib/supabase";
import { request } from "http";

const API_URL = process.env.NEXT_PUBLIC_API ?? "";

type RequestOptions = Omit<AxiosRequestConfig, "auth"> & {
  auth?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const normalizedBase = API_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const headersToObject = (headers?: RequestOptions["headers"]) => {
  const requestHeaders = new Headers(headers as HeadersInit);
  const result: Record<string, string> = {};
  requestHeaders.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

export async function apiRequest<T>(
  path: string,
  { auth = true, query, headers, body, ...options }: RequestOptions = {},
): Promise<T> {
  try {
    const requestHeaders = headersToObject(headers);

    if (body && !(body instanceof FormData) && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (auth) {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (!session?.access_token) {
          throw new Error("You need to sign in first.");
        }

        requestHeaders["Authorization"] = `Bearer ${session.access_token}`;
      } catch (authError) {
        throw authError instanceof Error ? authError : new Error("Authentication failed");
      }
    }

    try {
      console.log(requestHeaders);
      console.log(body);
      console.log(options);
      console.log(buildUrl(path, query));
      const response = await axios.request<T>({
        url: buildUrl(path, query),
        method: options.method ?? "GET",
        headers: requestHeaders,
        data: body,
        ...options,
      });

      return response.data;
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const responseData = requestError.response?.data;
        const message =
          typeof responseData === "object" && responseData !== null && "message" in responseData
            ? String((responseData as any).message)
            : typeof responseData === "object" && responseData !== null && "error" in responseData
              ? String((responseData as any).error)
              : requestError.message || `Request failed with status ${requestError.response?.status ?? "unknown"}`;

        throw new Error(message);
      }

      throw requestError instanceof Error ? requestError : new Error("Request failed");
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("An unexpected error occurred");
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body: data }),
  patch: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body: data }),
  put: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body: data }),
  delete: <T>(path: string, data?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE", body: data }),
};

export default api;
