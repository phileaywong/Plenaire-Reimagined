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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Eye, Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  product?: {
    name: string;
    imageUrl: string;
  };
  user?: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

const ReviewsManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/reviews"],
    queryFn: async () => {
      const response = await fetch("/api/admin/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json() as Promise<Review[]>;
    },
  });

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setIsViewDialogOpen(true);
  };

  const filteredReviews = reviews?.filter(
    (review) =>
      (review.product?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (review.comment || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (review.user?.email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
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
        Error loading reviews: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Reviews</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by product, comment, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    {review.createdAt
                      ? format(new Date(review.createdAt), "PP")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    <div className="flex items-center space-x-2">
                      {review.product?.imageUrl && (
                        <img
                          src={review.product.imageUrl}
                          alt={review.product.name}
                          className="h-8 w-8 object-cover rounded-md"
                        />
                      )}
                      <span>{review.product?.name || "Unknown Product"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.user
                      ? review.user.firstName && review.user.lastName
                        ? `${review.user.firstName} ${review.user.lastName}`
                        : review.user.email
                      : "Unknown"}
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.comment || "No comment"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReview(review)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {searchQuery
                    ? "No matching reviews found"
                    : "No reviews found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Total Reviews: {reviews?.length || 0}
        {searchQuery && filteredReviews
          ? ` (Filtered: ${filteredReviews.length})`
          : ""}
      </div>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Product</h3>
                <div className="flex items-center space-x-3 mt-1">
                  {selectedReview.product?.imageUrl && (
                    <img
                      src={selectedReview.product.imageUrl}
                      alt={selectedReview.product.name}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  )}
                  <span className="font-medium">
                    {selectedReview.product?.name || "Unknown Product"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Customer</h3>
                <p>
                  {selectedReview.user
                    ? selectedReview.user.firstName && selectedReview.user.lastName
                      ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}`
                      : selectedReview.user.email
                    : "Unknown"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Date</h3>
                <p>
                  {selectedReview.createdAt
                    ? format(new Date(selectedReview.createdAt), "PPP")
                    : "N/A"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Rating</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {renderStars(selectedReview.rating)}
                  <span>({selectedReview.rating}/5)</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Comment</h3>
                {selectedReview.comment ? (
                  <div className="mt-1 p-3 border rounded-md bg-muted/30 whitespace-pre-wrap">
                    {selectedReview.comment}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No comment provided</p>
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

export default ReviewsManagement;