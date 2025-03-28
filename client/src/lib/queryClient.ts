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
  // Log request for debugging
  console.log(`API Request: ${method} ${url}`, data);
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Log response status for debugging
  console.log(`API Response: ${method} ${url} - Status: ${res.status}`);
  
  // Don't throw here - let the caller handle errors
  // This way we can return the response even if it's an error
  // await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Query request: GET ${url}`);
    
    const res = await fetch(url, {
      credentials: "include",
    });
    
    console.log(`Query response: GET ${url} - Status: ${res.status}`);

    // Handle 401 (Unauthorized) based on options
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        console.log(`Query (${url}): Unauthorized, returning null as configured`);
        return null;
      } else {
        // Will throw an error below using throwIfResNotOk
        console.log(`Query (${url}): Unauthorized, will throw error as configured`);
      }
    }

    // Check if response is ok before parsing
    if (!res.ok) {
      try {
        const errorData = await res.json();
        console.error(`Query error (${url}):`, errorData);
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      } catch (jsonError) {
        // If JSON parsing fails, throw with status text
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }
    }
    
    // Only try to parse JSON if response is OK
    try {
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`Failed to parse JSON response from ${url}:`, error);
      throw new Error("Invalid response format from server");
    }
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
