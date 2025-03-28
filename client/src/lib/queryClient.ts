import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse response as JSON first
      const data = await res.json();
      
      // Log the error data for debugging
      console.log(`API error (${res.status}):`, data);
      
      if (data && data.message) {
        const error = new Error(data.message);
        
        // Copy additional properties from response data
        Object.assign(error, data);
        
        // Add the response status
        (error as any).status = res.status;
        
        throw error;
      }
      
      // If data exists but no message, create a generic error with the data
      throw new Error(
        `Request failed with status ${res.status}. Details: ${JSON.stringify(data)}`
      );
    } catch (jsonError) {
      // If not JSON or JSON parsing failed, handle as plain text
      try {
        const text = await res.text();
        console.log(`API error (${res.status}, non-JSON):`, text);
        throw new Error(text || res.statusText || `Request failed with status ${res.status}`);
      } catch (textError) {
        // In case of fetch or text parsing errors, use a fallback message
        console.log(`API error (${res.status}, failed to read body):`, textError);
        throw new Error(`Request failed with status ${res.status}`);
      }
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
