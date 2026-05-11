import axios, { AxiosRequestConfig } from "axios";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API ?? "";
let pendingSessionRequest: Promise<Session | null> | null = null;

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

export const getSupabaseSession = async () => {
  pendingSessionRequest ??= supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) {
        throw new Error(error.message);
      }

      return data.session;
    })
    .finally(() => {
      pendingSessionRequest = null;
    });

  return pendingSessionRequest;
};

export const getSupabaseAccessToken = async () => {
  const session = await getSupabaseSession();

  if (!session?.access_token) {
    throw new Error("You need to sign in first.");
  }

  return session.access_token;
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
        const accessToken = await getSupabaseAccessToken();
        requestHeaders["Authorization"] = `Bearer ${accessToken}`;
      } catch (authError) {
        throw authError instanceof Error ? authError : new Error("Authentication failed");
      }
    }

    try {
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
