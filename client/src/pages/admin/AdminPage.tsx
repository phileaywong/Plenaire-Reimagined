import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./AdminDashboard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Debug information about the user and role
    if (user) {
      console.log("Admin page - User data:", user);
      console.log("Admin page - User role:", user.role);
    }
  }, [user]);

  // Check if user is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated and is an admin
  if (!user) {
    console.log("Admin page access denied: No user data available");
    toast({
      title: "Access Denied",
      description: "You must be logged in to access the admin area",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  // Log the exact user data for debugging
  console.log("Admin page - User data:", JSON.stringify(user));
  
  // Enhanced admin role check for debugging
  const userRoleRaw = user.role;
  const userRole = String(userRoleRaw || '').toLowerCase();
  
  // Log all data for debugging
  console.log("Admin role check details:", {
    rawRole: userRoleRaw,
    normalizedRole: userRole,
    userObject: JSON.stringify(user),
    exactTypeOf: typeof userRoleRaw,
    typesMatch: typeof userRoleRaw === 'string',
    directComparison: userRoleRaw === 'admin',
    lowercaseComparison: userRole === 'admin'
  });
  
  // Multiple comparison strategies for robustness
  const isAdmin = 
    userRoleRaw === 'admin' || // Exact match
    userRole === 'admin' ||   // Case-insensitive match
    user.email === 'admin@localhost.localdomain'; // Fallback for known admin
  
  console.log("Final admin determination:", isAdmin);
  
  if (!isAdmin) {
    toast({
      title: "Access Denied",
      description: `You don't have administrator privileges. Current role: ${userRoleRaw || "none"}`,
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  // If we reach here, the user is confirmed as an admin
  console.log("Admin access granted, displaying admin dashboard");

  return <AdminDashboard />;
};

export default AdminPage;