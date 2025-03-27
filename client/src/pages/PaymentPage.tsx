import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component
function PaymentForm({ orderId, orderNumber, total }: { orderId: string; orderNumber: string; total: number }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'An error occurred during payment processing');
      setIsProcessing(false);
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed successfully',
      });
      setLocation(`/order-confirmation/${orderId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Order Summary</h3>
        <div className="flex justify-between text-sm">
          <span>Order #{orderNumber}</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border p-4 rounded-md">
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="text-sm text-destructive">
          {paymentError}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [params] = useParams();
  const orderId = params?.id;
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get order details
  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ['/api/orders', orderId],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/orders/${orderId}`);
        return res.json();
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          setLocation('/login');
          return null;
        }
        throw error;
      }
    },
    enabled: !!orderId,
  });

  // Create payment intent
  useEffect(() => {
    if (order) {
      const createPaymentIntent = async () => {
        try {
          const res = await apiRequest('POST', '/api/create-payment-intent', { orderId });
          const data = await res.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
          toast({
            title: 'Payment error',
            description: 'Unable to initialize payment. Please try again later.',
            variant: 'destructive',
          });
        }
      };

      createPaymentIntent();
    }
  }, [order, orderId, toast]);

  if (orderLoading || !order) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-serif font-light tracking-wide text-center mb-8">Complete Your Payment</h1>
      
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#D2A175',
                  },
                },
              }}
            >
              <PaymentForm 
                orderId={order.id.toString()} 
                orderNumber={order.orderNumber} 
                total={order.total}
              />
            </Elements>
          ) : (
            <div className="flex justify-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}