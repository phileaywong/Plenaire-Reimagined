import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CartItem, Product, Address } from '@/lib/types';

// Address selection schema
const checkoutSchema = z.object({
  shippingAddressId: z.string().min(1, { message: 'Please select a shipping address' }),
  billingAddressId: z.string().min(1, { message: 'Please select a billing address' }),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Checkout Component
export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/cart');
        const data = await res.json();
        return data;
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Response && error.status === 401) {
          toast({
            title: 'Authentication required',
            description: 'Please log in to continue with checkout.',
            variant: 'destructive',
          });
          setLocation('/login');
          return [];
        }
        throw error;
      }
    }
  });

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['/api/addresses'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/addresses');
        const data = await res.json();
        return data;
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          return [];
        }
        throw error;
      }
    }
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddressId: '',
      billingAddressId: '',
      notes: '',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      toast({
        title: 'Cart is empty',
        description: 'Your cart is empty. Please add items before checking out.',
      });
      setLocation('/cart');
    }
  }, [cartItems, cartLoading, setLocation, toast]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const response = await apiRequest('POST', '/api/orders', {
        ...data,
        shippingAddressId: parseInt(data.shippingAddressId),
        billingAddressId: parseInt(data.billingAddressId),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setOrderId(data.id);
      
      // Redirect to payment page
      redirectToPayment(data.id);
    },
    onError: () => {
      toast({
        title: 'Checkout failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  });

  // Redirect to payment page
  const redirectToPayment = (orderId: number) => {
    try {
      setIsLoading(false);
      setLocation(`/payment/${orderId}`);
    } catch (error) {
      toast({
        title: 'Checkout error',
        description: 'There was an error processing your order. Please try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  async function onSubmit(values: CheckoutFormValues) {
    if (!addresses || addresses.length === 0) {
      toast({
        title: 'Address required',
        description: 'Please add a shipping and billing address to continue.',
        variant: 'destructive',
      });
      setLocation('/account/addresses');
      return;
    }
    
    setIsLoading(true);
    createOrderMutation.mutate(values);
  }

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;
  
  // Loading state
  if (cartLoading || addressesLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-serif font-light tracking-wide text-center mb-8">Checkout</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {(!addresses || addresses.length === 0) ? (
            <div className="text-center py-6 border rounded-md">
              <p className="text-muted-foreground mb-4">You haven't added any addresses yet</p>
              <Button asChild>
                <Link href="/account/addresses">Add Address</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
                  
                  <FormField
                    control={form.control}
                    name="shippingAddressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {addresses.map((address) => (
                              <div key={address.id} className="flex items-start space-x-3 border p-4 rounded-md">
                                <RadioGroupItem value={address.id.toString()} id={`shipping-${address.id}`} />
                                <div>
                                  <div className="font-medium">
                                    {address.addressLine1}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {address.addressLine2 && <>{address.addressLine2}<br /></>}
                                    {address.city}, {address.state} {address.postalCode}<br />
                                    {address.country}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-medium mb-4">Billing Address</h2>
                  
                  <FormField
                    control={form.control}
                    name="billingAddressId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {addresses.map((address) => (
                              <div key={address.id} className="flex items-start space-x-3 border p-4 rounded-md">
                                <RadioGroupItem value={address.id.toString()} id={`billing-${address.id}`} />
                                <div>
                                  <div className="font-medium">
                                    {address.addressLine1}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {address.addressLine2 && <>{address.addressLine2}<br /></>}
                                    {address.city}, {address.state} {address.postalCode}<br />
                                    {address.country}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-medium mb-4">Order Notes</h2>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Special instructions for delivery or gift message" 
                            className="h-24"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Continue to Payment'}
                </Button>
              </form>
            </Form>
          )}
        </div>
        
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex items-center text-sm">
                  <div className="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-muted-foreground text-xs">Qty: {item.quantity}</div>
                  </div>
                  
                  <div className="text-right">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}