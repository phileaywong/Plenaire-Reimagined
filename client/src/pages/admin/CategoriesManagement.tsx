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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Form schema for categories
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoriesManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json() as Promise<Category[]>;
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Category created",
        description: "The category has been created successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues & { id: number }) => {
      const { id, ...rest } = data;
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
        variant: "default",
      });
      setIsDeleting(false);
      setCategoryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCategory = () => {
    form.reset({
      name: "",
      description: "",
      imageUrl: "",
    });
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    form.reset({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
    });
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
    }
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
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
        Error loading categories: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories Management</h2>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    {category.imageUrl && (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={
                    createCategoryMutation.isPending || 
                    updateCategoryMutation.isPending
                  }
                >
                  {(createCategoryMutation.isPending || 
                    updateCategoryMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the category{" "}
            <span className="font-bold">{categoryToDelete?.name}</span>? This
            action cannot be undone.
          </p>
          <p className="text-destructive">
            Note: Deleting a category may affect products associated with it.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagement;