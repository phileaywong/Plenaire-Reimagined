import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AdminDashboard from "./AdminDashboard";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated and is an admin
  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return <AdminDashboard />;
};

export default AdminPage;