import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { auth } from "./firebase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
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
  
  console.log('🔧 API Request Debug:', {
    method,
    url,
    hasAuthHeaders: Object.keys(authHeaders).length > 0,
    authHeaders: authHeaders,
    hasFirebaseUser: !!auth.currentUser,
    data
  });
  
  // Test if server is reachable with a simple test call first
  if (method === 'POST' && url.includes('/api/admin/')) {
    console.log('🧪 Testing server connectivity for admin POST...');
    try {
      const testResponse = await fetch('/api/test-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'connectivity' })
      });
      console.log('🧪 Test response:', {
        status: testResponse.status,
        ok: testResponse.ok,
        contentType: testResponse.headers.get('content-type')
      });
      const testText = await testResponse.text();
      console.log('🧪 Test response body (first 200 chars):', testText.substring(0, 200));
    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  }
  
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

  console.log('🔧 API Response:', {
    status: res.status,
    statusText: res.statusText,
    ok: res.ok
  });

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
