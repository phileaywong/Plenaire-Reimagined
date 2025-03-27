import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Order {
  id: number;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | null;
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "refunded" | null;
  total: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  orderItems: OrderItem[];
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

const OrdersManagement = () => {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json() as Promise<Order[]>;
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/orders/${id}/status`, {
        status,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
        variant: "default",
      });
      setIsStatusDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || "pending");
    setIsStatusDialogOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder && newStatus) {
      updateOrderStatusMutation.mutate({
        id: selectedOrder.id,
        status: newStatus,
      });
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "pending":
        return "outline";
      case "processing":
        return "secondary";
      case "shipped":
        return "default";
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "pending":
        return "outline";
      case "processing":
        return "secondary";
      case "completed":
        return "success";
      case "failed":
        return "destructive";
      case "refunded":
        return "default";
      default:
        return "outline";
    }
  };

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
        Error loading orders: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Management</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    {order.createdAt
                      ? format(new Date(order.createdAt), "PPP")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "Unknown"}
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status) as any}>
                      {order.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getPaymentStatusBadgeVariant(order.paymentStatus) as any
                      }
                    >
                      {order.paymentStatus || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p>Order #: {selectedOrder.orderNumber}</p>
                  <p>
                    Date:{" "}
                    {selectedOrder.createdAt
                      ? format(new Date(selectedOrder.createdAt), "PPP")
                      : "N/A"}
                  </p>
                  <p>Total: ${selectedOrder.total.toFixed(2)}</p>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">Status:</span>
                    <Badge
                      variant={
                        getStatusBadgeVariant(selectedOrder.status) as any
                      }
                    >
                      {selectedOrder.status || "pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">Payment:</span>
                    <Badge
                      variant={
                        getPaymentStatusBadgeVariant(
                          selectedOrder.paymentStatus
                        ) as any
                      }
                    >
                      {selectedOrder.paymentStatus || "pending"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  {selectedOrder.user ? (
                    <>
                      <p>
                        Name: {selectedOrder.user.firstName}{" "}
                        {selectedOrder.user.lastName}
                      </p>
                      <p>Email: {selectedOrder.user.email}</p>
                    </>
                  ) : (
                    <p>Customer information not available</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems &&
                      selectedOrder.orderItems.length > 0 ? (
                        selectedOrder.orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="flex items-center space-x-2">
                              {item.product && item.product.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product?.name}
                                  className="h-8 w-8 object-cover rounded-md"
                                />
                              )}
                              <span>{item.product?.name || "Unknown Product"}</span>
                            </TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No items in this order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p>
                Current Status:{" "}
                <Badge
                  variant={getStatusBadgeVariant(selectedOrder.status) as any}
                >
                  {selectedOrder.status || "pending"}
                </Badge>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status:</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmStatusUpdate}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;