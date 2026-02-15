import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;

    // Check if this is a trial expiration error
    if (res.status === 403) {
      try {
        const errorData = JSON.parse(text);

        // Trial expired - redirect to upgrade page
        if (errorData.trialExpired || errorData.requiresUpgrade) {
          console.warn('🎟️ Trial expired - redirecting to upgrade page');
          window.location.href = '/trial-expired';
          throw new Error('Trial expired - redirecting...');
        }
      } catch (parseError) {
        // If we can't parse JSON, continue with normal error handling
      }
    }

    console.error('🚨 API Request Failed:', {
      status: res.status,
      statusText: res.statusText,
      responseText: text
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  
  // Get Firebase auth token if user is authenticated
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn("Failed to get Firebase token:", error);
    }
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  // ✅ SECURITY: Removed API request/response logging

  const isFormData = data instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: {
      // Don't set Content-Type for FormData - browser sets it automatically with boundary
      ...(data && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
    },
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "include",
  });

  // ✅ SECURITY: Removed API response logging

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
