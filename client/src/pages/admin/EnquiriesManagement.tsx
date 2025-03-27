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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isResolved: boolean | null;
  createdAt: string;
  userId: number | null;
}

const EnquiriesManagement = () => {
  const { toast } = useToast();
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    data: enquiries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/enquiries"],
    queryFn: async () => {
      const response = await fetch("/api/admin/enquiries");
      if (!response.ok) throw new Error("Failed to fetch enquiries");
      return response.json() as Promise<Enquiry[]>;
    },
  });

  const resolveEnquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/admin/enquiries/${id}/resolve`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enquiries"] });
      toast({
        title: "Enquiry resolved",
        description: "The enquiry has been marked as resolved.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resolve enquiry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsViewDialogOpen(true);
  };

  const handleResolveEnquiry = (id: number) => {
    resolveEnquiryMutation.mutate(id);
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
        Error loading enquiries: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Enquiries</h2>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enquiries && enquiries.length > 0 ? (
              enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    {enquiry.createdAt
                      ? format(new Date(enquiry.createdAt), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{enquiry.name}</TableCell>
                  <TableCell>{enquiry.email}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {enquiry.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={enquiry.isResolved ? "outline" : "secondary"}
                    >
                      {enquiry.isResolved ? "Resolved" : "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEnquiry(enquiry)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {!enquiry.isResolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveEnquiry(enquiry.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No enquiries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Enquiry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Date</h3>
                  <p>
                    {selectedEnquiry.createdAt
                      ? format(new Date(selectedEnquiry.createdAt), "PPP")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <Badge
                    variant={selectedEnquiry.isResolved ? "outline" : "secondary"}
                    className="mt-1"
                  >
                    {selectedEnquiry.isResolved ? "Resolved" : "Open"}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Contact Information</h3>
                <p>Name: {selectedEnquiry.name}</p>
                <p>Email: {selectedEnquiry.email}</p>
                <p>Phone: {selectedEnquiry.phone || "Not provided"}</p>
              </div>

              <div>
                <h3 className="font-semibold">Subject</h3>
                <p>{selectedEnquiry.subject}</p>
              </div>

              <div>
                <h3 className="font-semibold">Message</h3>
                <div className="mt-1 p-3 border rounded-md bg-muted/30 whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedEnquiry && !selectedEnquiry.isResolved && (
              <Button 
                variant="outline"
                onClick={() => handleResolveEnquiry(selectedEnquiry.id)}
                disabled={resolveEnquiryMutation.isPending}
                className="mr-auto"
              >
                {resolveEnquiryMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Mark as Resolved
              </Button>
            )}
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnquiriesManagement;