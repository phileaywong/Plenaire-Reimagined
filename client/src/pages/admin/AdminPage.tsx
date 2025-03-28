import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./AdminDashboard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const AdminPage = () => {
  const { user, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Display a loading state while we're fetching auth data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    console.log("Admin page access denied: Not logged in");
    toast({
      title: "Access Denied",
      description: "You must be logged in to access the admin area",
      variant: "destructive",
    });
    setLocation("/login");
    return null;
  }
  
  // Enhanced admin check that combines all approaches
  const isKnownAdminEmail = user.email === 'admin@localhost.localdomain';
  const isRoleAdmin = user.role === 'admin' || user.role === 'ADMIN' || 
                      (typeof user.role === 'string' && user.role.toLowerCase() === 'admin');
  // Handle numeric roles safely with proper type checking
  const isNumericStringRole = typeof user.role === 'string' && user.role === '1';
  const isNumericAdminRole = isNumericStringRole;
  
  // Combine all checks - any match means admin access
  const hasAdminAccess = isAdmin || isKnownAdminEmail || isRoleAdmin || isNumericAdminRole;
  
  // Very detailed logging for troubleshooting
  console.log("Admin access check - DETAILED BREAKDOWN:", {
    hookReportedAdmin: isAdmin,
    email: user.email,
    isKnownAdmin: isKnownAdminEmail,
    role: user.role,
    roleType: typeof user.role,
    isRoleAdmin,
    isNumericAdmin: isNumericAdminRole,
    finalDecision: hasAdminAccess
  });
  
  // If all checks fail, deny access
  if (!hasAdminAccess) {
    console.log("Admin page access denied: Not an admin");
    toast({
      title: "Access Denied",
      description: `You don't have administrator privileges. If you believe this is an error, please contact support.`,
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  // We have confirmed admin access at this point
  console.log("Admin access granted, displaying admin dashboard");
  
  return <AdminDashboard />;
};

export default AdminPage;