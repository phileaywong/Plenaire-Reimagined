import React, { useState } from "react";
import { Layout, LayoutContent, LayoutHeader } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  Truck, 
  BarChart3, 
  MessageSquare, 
  Mail,
  Star,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import ProductsManagement from "./ProductsManagement";
import OrdersManagement from "./OrdersManagement";
import CustomersManagement from "./CustomersManagement";
import CategoriesManagement from "./CategoriesManagement";
import SalesReporting from "./SalesReporting";
import EnquiriesManagement from "./EnquiriesManagement";
import NewsletterManagement from "./NewsletterManagement";
import ReviewsManagement from "./ReviewsManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/");
  };

  return (
    <Layout>
      <LayoutHeader className="border-b border-border bg-background">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">Plenaire Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex w-full">
            <div className="w-1/6 min-w-[200px] border-r border-border h-[calc(100vh-64px)] p-4">
              <TabsList className="flex flex-col w-full h-auto space-y-2">
                <TabsTrigger
                  value="products"
                  className="w-full justify-start px-3 py-2"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="w-full justify-start px-3 py-2"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Categories
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="w-full justify-start px-3 py-2"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="customers"
                  className="w-full justify-start px-3 py-2"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </TabsTrigger>
                <TabsTrigger
                  value="sales"
                  className="w-full justify-start px-3 py-2"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Sales & Reports
                </TabsTrigger>
                <TabsTrigger
                  value="enquiries"
                  className="w-full justify-start px-3 py-2"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enquiries
                </TabsTrigger>
                <TabsTrigger
                  value="newsletter"
                  className="w-full justify-start px-3 py-2"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Newsletter
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="w-full justify-start px-3 py-2"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Reviews
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="w-5/6 p-6 overflow-auto h-[calc(100vh-64px)]">
              <TabsContent value="products" className="mt-0">
                <ProductsManagement />
              </TabsContent>
              <TabsContent value="categories" className="mt-0">
                <CategoriesManagement />
              </TabsContent>
              <TabsContent value="orders" className="mt-0">
                <OrdersManagement />
              </TabsContent>
              <TabsContent value="customers" className="mt-0">
                <CustomersManagement />
              </TabsContent>
              <TabsContent value="sales" className="mt-0">
                <SalesReporting />
              </TabsContent>
              <TabsContent value="enquiries" className="mt-0">
                <EnquiriesManagement />
              </TabsContent>
              <TabsContent value="newsletter" className="mt-0">
                <NewsletterManagement />
              </TabsContent>
              <TabsContent value="reviews" className="mt-0">
                <ReviewsManagement />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </LayoutContent>
    </Layout>
  );
};

export default AdminDashboard;