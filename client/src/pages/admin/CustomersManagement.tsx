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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "user" | "admin" | null;
  createdAt: string;
  orders?: Order[];
  addresses?: Address[];
}

interface Order {
  id: number;
  orderNumber: string;
  status: string | null;
  total: number;
  createdAt: string;
}

interface Address {
  id: number;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean | null;
}

const CustomersManagement = () => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<User[]>;
    },
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
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
        Error loading users: {error.message}
      </div>
    );
  }

  const filteredUsers = users?.filter(user => user.role !== "admin") || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    {user.createdAt
                      ? format(new Date(user.createdAt), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Personal Information</h3>
                  <p>
                    Name:{" "}
                    {selectedUser.firstName && selectedUser.lastName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : "N/A"}
                  </p>
                  <p>Email: {selectedUser.email}</p>
                  <p>Phone: {selectedUser.phone || "N/A"}</p>
                  <p>
                    Member since:{" "}
                    {selectedUser.createdAt
                      ? format(new Date(selectedUser.createdAt), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Account Information</h3>
                  <p>Account ID: {selectedUser.id}</p>
                  <p>Role: {selectedUser.role || "user"}</p>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="font-semibold mb-2">Addresses</h3>
                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border p-3 rounded-md space-y-1"
                      >
                        {address.isDefault && (
                          <Badge className="mb-1">Default</Badge>
                        )}
                        <p>
                          {address.addressLine1}
                          {address.addressLine2 &&
                            `, ${address.addressLine2}`}
                        </p>
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No addresses found</p>
                )}
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold mb-2">Order History</h3>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>
                              {order.createdAt
                                ? format(new Date(order.createdAt), "PP")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  getStatusBadgeVariant(order.status) as any
                                }
                              >
                                {order.status || "pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No orders found</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersManagement;