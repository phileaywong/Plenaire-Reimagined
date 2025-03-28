import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CartItem, Product } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrashIcon, MinusIcon, PlusIcon } from 'lucide-react';

export default function Cart() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/cart');
        const data = await res.json();
        return data;
      } catch (error) {
        // If unauthorized, return empty array
        if (error instanceof Response && error.status === 401) {
          return [];
        }
        throw error;
      }
    }
  });

  // Update cart item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/items/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: 'Failed to update item',
        description: 'There was an error updating your cart. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Remove cart item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove item',
        description: 'There was an error removing the item. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to clear cart',
        description: 'There was an error clearing your cart. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Calculate total
  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const shipping = subtotal > 0 ? 10 : 0; // Free shipping over $100
  const total = subtotal + shipping;

  // Handle quantity change
  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemMutation.mutate({ id, quantity: newQuantity });
  };

  // Handle proceed to checkout
  const handleCheckout = async () => {
    if (!cartItems?.length) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      console.log("Starting checkout process with items:", cartItems);
      
      // Create an order first with detailed error handling
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        })
      });
      
      // Capture response regardless of status
      const responseData = await response.json();
      console.log("Order creation response:", response.status, responseData);
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          toast({
            title: 'Authentication required',
            description: 'Please sign in to complete your purchase.',
            variant: 'destructive',
          });
          setLocation('/login');
          return;
        }
        
        throw new Error(responseData.message || 'Failed to create order');
      }
      
      // Success path - navigate to checkout with order ID
      console.log("Order created successfully:", responseData);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      if (responseData.id) {
        setLocation(`/checkout/${responseData.id}`);
      } else {
        console.error("Order created but no ID returned:", responseData);
        throw new Error("Order created but no ID was returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'There was an error processing your checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-serif font-light tracking-wide text-center mb-8">Shopping Cart</h1>
      
      {(!cartItems || cartItems.length === 0) ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <Button onClick={() => setLocation("/products")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 flex items-center">
                  <div className="w-20 h-20 rounded overflow-hidden mr-4 flex-shrink-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-muted-foreground text-sm">${item.product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updateItemMutation.isPending}
                      className="h-8 w-8"
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    
                    <span className="mx-2 text-center w-8">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updateItemMutation.isPending}
                      className="h-8 w-8"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="ml-6 text-right w-20">
                    <div className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      disabled={removeItemMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
              >
                Clear Cart
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setLocation("/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full mt-6" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}