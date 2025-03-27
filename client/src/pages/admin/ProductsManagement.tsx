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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, type Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

// Extend the product schema for the form
const productFormSchema = insertProductSchema.extend({
  // Add any additional validation
  price: z.coerce.number().min(0, "Price must be non-negative"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const ProductsManagement = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json() as Promise<Product[]>;
    },
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      sku: "",
      featured: false,
      reviewCount: 0,
      ingredients: [],
      categoryId: null,
      stock: 0,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/admin/products", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues & { id: number }) => {
      const { id, ...rest } = data;
      const res = await apiRequest("PUT", `/api/admin/products/${id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
        variant: "default",
      });
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
        variant: "default",
      });
      setIsDeleting(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = () => {
    form.reset({
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
      sku: "",
      featured: false,
      reviewCount: 0,
      ingredients: [],
      categoryId: null,
      stock: 0,
    });
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    form.reset({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      sku: product.sku,
      featured: product.featured ?? false,
      reviewCount: product.reviewCount ?? 0,
      ingredients: product.ingredients ?? [],
      categoryId: product.categoryId,
      stock: product.stock ?? 0,
    });
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleting(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate({ ...data, id: editingProduct.id });
    } else {
      createProductMutation.mutate(data);
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
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock ?? "N/A"}</TableCell>
                  <TableCell>
                    {product.featured ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category ID</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value || ""} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Featured Product</FormLabel>
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
                    createProductMutation.isPending || 
                    updateProductMutation.isPending
                  }
                >
                  {(createProductMutation.isPending || 
                    updateProductMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Update" : "Create"}
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
            Are you sure you want to delete{" "}
            <span className="font-bold">{productToDelete?.name}</span>? This
            action cannot be undone.
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
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending && (
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

export default ProductsManagement;