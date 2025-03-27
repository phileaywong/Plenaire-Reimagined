import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CreditCard, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface Order {
  id: number;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  total: number;
  createdAt: string;
  userId: number;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    categoryId: number | null;
  };
}

interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  category?: { 
    name: string;
  };
}

const SalesReporting = () => {
  const [timeRange, setTimeRange] = useState("last30days");
  const [selectedTab, setSelectedTab] = useState("overview");

  const {
    data: orders,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json() as Promise<Order[]>;
    },
  });

  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json() as Promise<Product[]>;
    },
  });

  const isLoading = isOrdersLoading || isProductsLoading;
  const error = ordersError || productsError;

  // Filter orders based on selected time range
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "last7days":
        startDate = subDays(now, 7);
        break;
      case "last30days":
        startDate = subDays(now, 30);
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(now), 1);
        startDate = startOfMonth(lastMonth);
        const endDate = endOfMonth(lastMonth);
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      default:
        startDate = subDays(now, 30);
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  }, [orders, timeRange]);

  // Calculate overview metrics
  const totalSales = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const totalOrders = filteredOrders.length;

  const averageOrderValue = useMemo(() => {
    return totalOrders > 0 ? totalSales / totalOrders : 0;
  }, [totalSales, totalOrders]);

  const totalCustomers = useMemo(() => {
    if (!filteredOrders.length) return 0;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.userId));
    return uniqueCustomers.size;
  }, [filteredOrders]);

  // Prepare data for sales by day chart
  const salesByDayData = useMemo(() => {
    if (!filteredOrders.length) return [];

    let startDate;
    const now = new Date();
    
    switch (timeRange) {
      case "last7days":
        startDate = subDays(now, 7);
        break;
      case "last30days":
        startDate = subDays(now, 30);
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(now), 1);
        startDate = startOfMonth(lastMonth);
        break;
      default:
        startDate = subDays(now, 30);
    }

    const dateRange = eachDayOfInterval({ start: startDate, end: now });
    
    return dateRange.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOrders = filteredOrders.filter(
        order => order.createdAt.substring(0, 10) === dateStr
      );
      const totalForDay = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      return {
        date: format(date, "MMM dd"),
        sales: totalForDay,
        orders: dayOrders.length,
      };
    });
  }, [filteredOrders, timeRange]);

  // Prepare data for product category sales chart
  const categorySalesData = useMemo(() => {
    if (!filteredOrders.length || !products) return [];

    const categoryMap = new Map();
    
    filteredOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const categoryId = product?.categoryId || 0;
        const categoryName = product?.category?.name || "Uncategorized";
        
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            name: categoryName,
            sales: 0,
          });
        }
        
        const categoryData = categoryMap.get(categoryId);
        categoryData.sales += item.price * item.quantity;
        categoryMap.set(categoryId, categoryData);
      });
    });
    
    return Array.from(categoryMap.values());
  }, [filteredOrders, products]);

  // Prepare data for top selling products chart
  const topSellingProductsData = useMemo(() => {
    if (!filteredOrders.length || !products) return [];

    const productSales = new Map();
    
    filteredOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.productId;
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        if (!productSales.has(productId)) {
          productSales.set(productId, {
            id: productId,
            name: product.name,
            quantity: 0,
            revenue: 0,
          });
        }
        
        const data = productSales.get(productId);
        data.quantity += item.quantity;
        data.revenue += item.price * item.quantity;
        productSales.set(productId, data);
      });
    });
    
    // Sort by revenue and get top 5
    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders, products]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales & Reports</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              For the selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Daily sales and order trends for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByDayData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Products with the highest revenue for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingProductsData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tickFormatter={(value) => 
                        value.length > 15 ? `${value.substring(0, 15)}...` : value
                      }
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? `$${value}` : value,
                        name === 'revenue' ? 'Revenue' : 'Units Sold'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                    <Bar dataKey="quantity" fill="#82ca9d" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Revenue distribution across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySalesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="sales"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categorySalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesReporting;