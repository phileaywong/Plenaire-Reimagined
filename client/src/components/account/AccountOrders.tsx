import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Link } from 'wouter';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  ShoppingBag, 
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Status mapping for icons and colors
const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'text-yellow-500',
    badge: 'text-yellow-700 bg-yellow-100'
  },
  processing: { 
    icon: AlertCircle, 
    color: 'text-blue-500',
    badge: 'text-blue-700 bg-blue-100'
  },
  shipped: { 
    icon: Truck, 
    color: 'text-indigo-500',
    badge: 'text-indigo-700 bg-indigo-100'
  },
  delivered: { 
    icon: CheckCircle, 
    color: 'text-green-500',
    badge: 'text-green-700 bg-green-100'
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-red-500',
    badge: 'text-red-700 bg-red-100'
  },
};

// Payment status mapping
const paymentStatusConfig = {
  pending: { 
    badge: 'text-yellow-700 bg-yellow-100'
  },
  processing: { 
    badge: 'text-blue-700 bg-blue-100'
  },
  completed: { 
    badge: 'text-green-700 bg-green-100'
  },
  failed: { 
    badge: 'text-red-700 bg-red-100'
  },
  refunded: { 
    badge: 'text-purple-700 bg-purple-100'
  },
};

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
}

interface OrderWithItems extends Order {
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

export default function AccountOrders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/orders');
      return res.json();
    },
  });
  
  // Fetch order details
  const handleViewOrder = async (orderId: number) => {
    try {
      const res = await apiRequest('GET', `/api/orders/${orderId}`);
      const orderDetails = await res.json();
      setSelectedOrder(orderDetails);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || AlertCircle;
    const iconColor = statusConfig[status as keyof typeof statusConfig]?.color || 'text-gray-500';
    
    return <StatusIcon className={`h-5 w-5 ${iconColor}`} />;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-serif font-light mb-6">Your Orders</h2>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          <Card className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.badge || ''}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig]?.badge || ''}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewOrder(order.id)}
                        className="gap-1"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          
          {/* Order Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Order #{selectedOrder?.orderNumber}
                </DialogTitle>
                <DialogDescription>
                  Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color || 'text-gray-500'}>
                          {getStatusIcon(selectedOrder.status)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Order Status</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Payment Status</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                          </p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-primary">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Order Total</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(selectedOrder.total)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <Accordion type="single" collapsible defaultValue="items">
                    <AccordionItem value="items">
                      <AccordionTrigger>
                        <h3 className="text-base font-medium">Order Items</h3>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {selectedOrder.items.map((item) => (
                            <div key={item.id} className="flex gap-4 py-2 border-b">
                              <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <Link href={`/product/${item.product.id}`}>
                                    <h4 className="font-medium hover:text-primary">
                                      {item.product.name}
                                    </h4>
                                  </Link>
                                  <span className="font-medium">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Quantity: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
          <Button asChild>
            <Link href="/products">
              Start Shopping
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}