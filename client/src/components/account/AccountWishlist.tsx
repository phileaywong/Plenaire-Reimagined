import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Wishlist, Product } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Heart, ShoppingCart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AccountWishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: number, name: string} | null>(null);
  
  // Fetch wishlist
  const { data: wishlistItems, isLoading } = useQuery<(Wishlist & { product: Product })[]>({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/wishlist');
      return res.json();
    },
  });
  
  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: 'Product removed',
        description: 'The product has been removed from your wishlist.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error removing the product from your wishlist.',
        variant: 'destructive',
      });
    },
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('POST', '/api/cart/items', { productId, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: 'Added to cart',
        description: 'The product has been added to your cart.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error adding the product to your cart.',
        variant: 'destructive',
      });
    },
  });
  
  // Function to handle removing item from wishlist
  const handleRemoveFromWishlist = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  // Function to handle adding item to cart
  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate(productId);
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
      <h2 className="text-2xl font-serif font-light mb-6">Your Wishlist</h2>
      
      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(({ product }) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
              </div>
              
              <CardContent className="p-4">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium text-lg hover:text-primary cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground font-light my-1 line-clamp-2">
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description}
                </p>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                  
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRemoveFromWishlist(product)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button asChild>
            <Link href="/products">
              Browse Products
            </Link>
          </Button>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Wishlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{selectedProduct?.name}" from your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedProduct && removeFromWishlistMutation.mutate(selectedProduct.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeFromWishlistMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full" aria-label="Loading"/>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}