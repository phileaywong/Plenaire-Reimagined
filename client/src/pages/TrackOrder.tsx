import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, Package, Truck } from "lucide-react";

// Track order schema
const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Please enter a valid email address"),
});

type TrackOrderFormValues = z.infer<typeof trackOrderSchema>;

// Mock order statuses for demonstration
type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered" | null;

export default function TrackOrder() {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<TrackOrderFormValues>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: {
      orderNumber: "",
      email: "",
    },
  });

  // Handle tracking form submission
  const onSubmit = (values: TrackOrderFormValues) => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Demo: set a random status based on the first digit of the order number
      const firstDigit = parseInt(values.orderNumber[0]) || 0;
      const statuses: OrderStatus[] = ["processing", "shipped", "out_for_delivery", "delivered"];
      setOrderStatus(statuses[firstDigit % 4]);
      setIsLoading(false);
    }, 1500);
  };

  // Get the appropriate status icon
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return <Clock className="h-8 w-8 text-amber-500" />;
      case "shipped":
        return <Package className="h-8 w-8 text-blue-500" />;
      case "out_for_delivery":
        return <Truck className="h-8 w-8 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  // Get the status text description
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "Your order is being processed and prepared for shipping.";
      case "shipped":
        return "Your order has been shipped and is on its way to you.";
      case "out_for_delivery":
        return "Your order is out for delivery and will be delivered today.";
      case "delivered":
        return "Your order has been delivered. Thank you for shopping with us!";
      default:
        return "We couldn't find your order. Please check your order number and email.";
    }
  };

  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-16">
        Track Your Order
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-medium">Enter Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PLEN-12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email used for order" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Tracking..." : "Track Order"}
                </Button>
              </form>
            </Form>
            
            {orderStatus !== null && (
              <>
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Order Status</h3>
                  
                  <div className="flex space-x-4">
                    {getStatusIcon(orderStatus)}
                    
                    <div>
                      <h4 className="font-medium capitalize">{orderStatus?.replace("_", " ") || "Not Found"}</h4>
                      <p className="text-gray-600">{getStatusText(orderStatus)}</p>
                    </div>
                  </div>
                  
                  {orderStatus && orderStatus !== "not_found" && (
                    <div className="pt-4">
                      <h4 className="font-medium mb-3">Shipping Progress</h4>
                      
                      <div className="relative">
                        <div className="overflow-hidden h-2 mb-4 flex rounded bg-gray-200">
                          <div
                            className="bg-primary"
                            style={{
                              width:
                                orderStatus === "processing"
                                  ? "25%"
                                  : orderStatus === "shipped"
                                  ? "50%"
                                  : orderStatus === "out_for_delivery"
                                  ? "75%"
                                  : "100%",
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <div className={`${orderStatus === "processing" || orderStatus === "shipped" || orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "text-primary font-medium" : ""}`}>
                            Processing
                          </div>
                          <div className={`${orderStatus === "shipped" || orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "text-primary font-medium" : ""}`}>
                            Shipped
                          </div>
                          <div className={`${orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "text-primary font-medium" : ""}`}>
                            Out for Delivery
                          </div>
                          <div className={`${orderStatus === "delivered" ? "text-primary font-medium" : ""}`}>
                            Delivered
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}