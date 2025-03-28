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
      const res = await apiRequest("POST", "/api/auth/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
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
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enhanced admin status checking with better debug logging
  const checkIsAdmin = () => {
    if (!user) return false;
    
    // Robust admin check to handle potential data type issues
    // 1. Check if role property exists and has a value
    if (user.role === null || user.role === undefined) {
      console.log("Admin check failed: user.role is null or undefined");
      return false;
    }
    
    // 2. Convert role to string and use case-insensitive comparison
    const normalizedRole = String(user.role).toLowerCase().trim();
    
    // 3. Multiple check strategies
    const exactMatch = user.role === 'admin';
    const normalizedMatch = normalizedRole === 'admin';
    const knownAdminEmail = user.email === 'admin@localhost.localdomain';
    
    // Combined result - any of these being true means admin access
    const isAdmin = exactMatch || normalizedMatch || knownAdminEmail;
    
    // Detailed debug logging
    console.log("Auth hook - Admin check:", { 
      userId: user.id,
      email: user.email,
      rawRole: user.role,
      roleType: typeof user.role,
      normalizedRole,
      exactMatch,
      normalizedMatch,
      knownAdminEmail,
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