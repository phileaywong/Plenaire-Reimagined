import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface OrderWithItems {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      price: number;
      imageUrl: string;
      description: string;
    }
  }[];
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch order details
  const { data: order, isLoading, error } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/orders/${orderId}`);
        const data = await res.json();
        return data;
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          setLocation('/login');
        }
        throw error;
      }
    },
    enabled: !!orderId,
  });
  
  // Show error toast if order fetch fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Could not retrieve order details. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  // Order not found
  if (!order) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-3xl font-serif font-light tracking-wide mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  const isPaymentComplete = order.paymentStatus === 'completed';
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="text-center mb-8">
        {isPaymentComplete ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-light tracking-wide">Thank You For Your Order!</h1>
            <p className="text-muted-foreground mt-2">Your order has been confirmed and is being processed.</p>
          </>
        ) : (
          <>
            <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-light tracking-wide">Order Received</h1>
            <p className="text-muted-foreground mt-2">Your payment is being processed. We'll send you a confirmation email shortly.</p>
          </>
        )}
      </div>
      
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Order Details</h2>
          <span className="text-sm text-muted-foreground">#{order.orderNumber}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-6">
          <div className="text-muted-foreground">Date:</div>
          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
          
          <div className="text-muted-foreground">Status:</div>
          <div>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
          
          <div className="text-muted-foreground">Payment:</div>
          <div>{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</div>
        </div>
        
        <Separator className="mb-6" />
        
        <h3 className="font-medium mb-3">Items</h3>
        <div className="space-y-3 mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center">
              <div className="w-16 h-16 rounded overflow-hidden mr-4 flex-shrink-0">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-grow">
                <div className="font-medium">{item.product.name}</div>
                <div className="text-muted-foreground text-xs">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
              </div>
              
              <div className="text-right">
                ${(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="mb-6" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${(order.total - 10).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>$10.00</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </Card>
      
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
        
        <Button asChild>
          <Link href="/account/orders">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
}