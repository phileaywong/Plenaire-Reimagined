import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Product, Wishlist } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Heart, ShoppingCart, Trash } from 'lucide-react';

export default function AccountWishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your wishlist.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error removing the item from your wishlist.',
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
        description: 'Item has been added to your cart.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'There was an error adding the item to your cart.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle remove from wishlist
  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlistMutation.mutate(productId);
  };
  
  // Handle add to cart
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
          {wishlistItems.map((item) => (
            <Card key={item.id} className="relative overflow-hidden group">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-background/80 hover:bg-background"
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  disabled={removeFromWishlistMutation.isPending}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="aspect-square relative overflow-hidden">
                <Link href={`/product/${item.product.id}`}>
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              
              <div className="p-4">
                <Link href={`/product/${item.product.id}`}>
                  <h3 className="font-medium mb-1 hover:text-primary transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-1 mb-3">
                  {item.product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">${item.product.price.toFixed(2)}</span>
                  
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(item.product.id)}
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending && addToCartMutation.variables === item.product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
          <Button asChild>
            <Link href="/">
              Start Shopping
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}