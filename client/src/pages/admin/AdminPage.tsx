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
    setLocation("/");
    return null;
  }
  
  // Log the exact user data for debugging
  console.log("Admin page access - User data:", {
    id: user.id,
    email: user.email,
    role: user.role,
    isAdmin
  });
  
  // Check for admin access using the isAdmin flag from the auth hook
  if (!isAdmin) {
    console.log("Admin page access denied: Not an admin");
    toast({
      title: "Access Denied",
      description: `You don't have administrator privileges. Current role: ${user.role || "none"}`,
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