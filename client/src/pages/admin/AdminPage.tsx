import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./AdminDashboard";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  // Log the FULL user object exactly as received
  console.log("=== ADMIN PAGE - RECEIVED USER OBJECT ===");
  console.log(JSON.stringify(user, null, 2));
  console.log("=== END USER OBJECT ===");
  
  // Most reliable check: we'll JUST use the isAdmin value from the hook
  // Since we've improved the hook logic, this should be the most robust option
  console.log("ADMIN ACCESS - Using hook's isAdmin value:", isAdmin);
  
  // Check for admin access - add fallback direct check if hook's isAdmin fails
  // This ensures we have multiple ways to identify admin users
  const directAdminCheck = 
    user.email === 'admin@localhost.localdomain' || 
    user.role === 'admin' || 
    user.role === 'ADMIN' || 
    user.role === 1 || 
    user.role === '1';
  
  // Log the direct check
  console.log("Admin direct check:", directAdminCheck, {
    email: user.email,
    emailMatch: user.email === 'admin@localhost.localdomain',
    role: user.role,
    roleType: typeof user.role
  });
  
  // Use either isAdmin from hook OR direct check
  if (!isAdmin && !directAdminCheck) {
    // Alert the user that they don't have access
    console.log("Admin page access denied: Not an admin");
    
    // Detailed logging for troubleshooting
    console.log("Admin check failed:", {
      email: user.email,
      role: user.role,
      roleType: typeof user.role,
      isKnownAdmin: user.email === 'admin@localhost.localdomain',
    });
    
    toast({
      title: "Access Denied",
      description: `You don't have administrator privileges. If you believe this is an error, please contact support.`,
      variant: "destructive",
    });
    
    // Redirect to home page
    setLocation("/");
    return null;
  }
  
  // We have confirmed admin access at this point
  console.log("Admin access granted, displaying admin dashboard");
  
  return <AdminDashboard />;
};

export default AdminPage;