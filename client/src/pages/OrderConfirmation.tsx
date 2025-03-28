import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, Loader2 } from "lucide-react";

// Define the Order type
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl?: string;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: {
    id: number;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentStatus: string;
}

export default function OrderConfirmation() {
  const [match, params] = useRoute<{ orderId: string }>('/order-confirmation/:orderId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !params) {
      setLocation('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await apiRequest("GET", `/api/orders/${params.orderId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order details');
        }
        
        const orderData = await response.json();
        setOrder(orderData);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || 'An error occurred while fetching your order details');
        toast({
          title: "Error",
          description: err.message || "Could not retrieve order information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [match, params?.orderId, setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
            <CardDescription>
              {error || "We couldn't find the order you're looking for."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/')} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-8">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
                <CardDescription>
                  Order #{order.id} • Placed on {new Date(order.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Shipping Address</h3>
                  <div className="text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Order Summary</h3>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Order Status:</span>
                      <span className="font-medium">{order.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <span className="font-medium">{order.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center border-b pb-4">
                      <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.productName} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.productName}</h4>
                        <div className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ${item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setLocation('/')} className="sm:flex-1">
              Continue Shopping
            </Button>
            <Button 
              onClick={() => setLocation('/account/orders')}
              variant="outline"
              className="sm:flex-1"
            >
              View All Orders
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}