import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Download } from "lucide-react";
import { format } from "date-fns";

interface NewsletterSubscription {
  id: number;
  email: string;
  createdAt: string;
  name: string | null;
}

const NewsletterManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: subscriptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/newsletter-subscriptions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter-subscriptions");
      if (!response.ok) throw new Error("Failed to fetch newsletter subscriptions");
      return response.json() as Promise<NewsletterSubscription[]>;
    },
  });

  const handleExportCSV = () => {
    if (!subscriptions || subscriptions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no newsletter subscriptions to export.",
        variant: "destructive",
      });
      return;
    }

    const header = ["ID", "Email", "Name", "Date Subscribed"];
    const rows = subscriptions.map((sub) => [
      sub.id.toString(),
      sub.email,
      sub.name || "",
      sub.createdAt ? format(new Date(sub.createdAt), "yyyy-MM-dd") : "",
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + header.join(",") + "\n"
      + rows.map(row => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Newsletter subscribers have been exported to CSV.",
      variant: "default",
    });
  };

  const filteredSubscriptions = subscriptions?.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.name &&
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        Error loading newsletter subscriptions: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={!subscriptions || subscriptions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" /> Export to CSV
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>{subscription.id}</TableCell>
                  <TableCell>{subscription.email}</TableCell>
                  <TableCell>{subscription.name || "N/A"}</TableCell>
                  <TableCell>
                    {subscription.createdAt
                      ? format(new Date(subscription.createdAt), "PP")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {searchQuery
                    ? "No matching subscribers found"
                    : "No newsletter subscribers found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Total Subscribers: {subscriptions?.length || 0}
        {searchQuery && filteredSubscriptions
          ? ` (Filtered: ${filteredSubscriptions.length})`
          : ""}
      </div>
    </div>
  );
};

export default NewsletterManagement;