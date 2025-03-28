import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// User type definition based on schema
interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string | null; // Using string instead of union type for more flexibility
  createdAt: Date | null;
  updatedAt: Date | null;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  loginMutation: any;
  logoutMutation: any;
  registerMutation: any;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [authInitialized, setAuthInitialized] = useState(false);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return await res.json();
      } catch (err) {
        console.error("Auth fetch error:", err);
        return null;
      }
    },
    enabled: authInitialized,
  });

  useEffect(() => {
    setAuthInitialized(true);
  }, []);

  // Define the LoginCredentials type
  type LoginCredentials = {
    username: string; 
    password: string; 
    captcha?: string;
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      // Convert credentials to match the API endpoint's expected format (email vs username)
      const apiCredentials = {
        email: credentials.username,
        password: credentials.password,
        captcha: credentials.captcha
      };
      
      console.log("Login attempt:", { email: apiCredentials.email });
      
      const res = await apiRequest("POST", "/api/auth/login", apiCredentials);
      
      // Check if response is not OK (4xx or 5xx)
      if (!res.ok) {
        let errorMessage = "Login failed";
        let requireCaptcha = false;
        
        try {
          // Try to parse the error as JSON
          const errorData = await res.json();
          console.log("Login error data:", errorData);
          
          // Use the server's error message if available
          errorMessage = errorData.message || errorMessage;
          
          // Check if captcha is required
          requireCaptcha = !!errorData.requireCaptcha;
        } catch (parseError) {
          // If we can't parse JSON, try to get text
          try {
            const errorText = await res.text();
            errorMessage = errorText || `Server error (${res.status})`;
          } catch (textError) {
            // If all else fails, use status text
            errorMessage = res.statusText || `Server error (${res.status})`;
          }
        }
        
        // Create error object
        const error = new Error(errorMessage);
        
        // Add properties to the error object
        (error as any).status = res.status;
        (error as any).requireCaptcha = requireCaptcha;
        
        throw error;
      }
      
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Login error in mutation:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      // Map frontend field names to match what the API expects
      const apiData = {
        email: userData.email || userData.username, // Support both email and username fields
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        phone: userData.phone || '',
      };
      
      console.log("Registration attempt with data:", {
        ...apiData,
        password: apiData.password ? "******" : undefined,
        confirmPassword: apiData.confirmPassword ? "******" : undefined
      });
      
      const res = await apiRequest("POST", "/api/auth/register", apiData);
      
      if (!res.ok) {
        let errorMessage = "Registration failed";
        try {
          const errorData = await res.json();
          console.log("Registration error data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Error parsing registration error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Registration successful",
        description: "Your account has been created",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Registration error in mutation:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      return res;
    },
    onSuccess: () => {
      // Ensure all auth-related queries are invalidated/reset
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Clear any other cached data that should be private
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Even more robust admin status checking with better debug logging
  const checkIsAdmin = () => {
    if (!user) return false;
    
    // CRITICAL: Log full user object for debugging
    console.log("AUTH HOOK - Full user object for admin detection:", JSON.stringify(user, null, 2));
    
    // 1. Early return for known admin email (most reliable check)
    const isKnownAdminEmail = user.email === 'admin@localhost.localdomain';
    
    // 2. Direct role check - handle various formats
    const adminValues = ['admin', 'ADMIN', 'Admin', '1'];
    const rawRole = user.role;
    
    // Handle string comparison
    let exactMatch = false;
    if (typeof rawRole === 'string') {
      exactMatch = adminValues.includes(rawRole);
    }
    
    // 3. Case-insensitive role check for more resilience
    let normalizedRole = '';
    if (rawRole !== null && rawRole !== undefined) {
      normalizedRole = String(rawRole).toLowerCase().trim();
    }
    const normalizedMatch = normalizedRole === 'admin';
    
    // 4. Numeric role check
    const numericMatch = rawRole === 1 || rawRole === '1';
    
    // Combine all strategies
    const isAdmin = exactMatch || normalizedMatch || isKnownAdminEmail || numericMatch;
    
    // Detailed debug logging
    console.log("AUTH HOOK - Admin check details:", { 
      userId: user.id,
      email: user.email,
      rawRole: rawRole,
      roleTypeOf: typeof rawRole,
      roleStringified: String(rawRole),
      normalizedRole,
      exactMatch,
      normalizedMatch,
      isKnownAdminEmail,
      numericMatch,
      finalResult: isAdmin
    });
    
    return isAdmin;
  };
  
  // Compute admin status
  const isAdmin = checkIsAdmin();

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error as Error | null,
        isAdmin,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}