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
  // Use loose comparison to handle potential string/null/undefined variations
  if (!user) {
    toast({
      title: "Access Denied",
      description: "You must be logged in to access the admin area",
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }
  
  if (user.role !== "admin") {
    toast({
      title: "Access Denied",
      description: `You don't have administrator privileges. Current role: ${user.role || "none"}`,
      variant: "destructive",
    });
    setLocation("/");
    return null;
  }

  return <AdminDashboard />;
};

export default AdminPage;