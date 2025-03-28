import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, orderId }: { amount: number, orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      // The redirect will happen automatically due to the return_url
      // But we'll keep the loading state just in case
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)}`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [match, params] = useRoute<{ orderId: string }>('/checkout/:orderId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    amount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!match) {
      setLocation('/cart');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // Get the order details first
        const orderResponse = await apiRequest("GET", `/api/orders/${params.orderId}`);
        const orderData = await orderResponse.json();
        
        if (!orderResponse.ok) {
          throw new Error(orderData.message || 'Failed to fetch order details');
        }
        
        setOrderDetails({
          id: orderData.id,
          amount: orderData.total,
        });

        // Create payment intent with the order amount
        const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: orderData.total,
          orderId: params.orderId
        });
        
        const paymentData = await paymentResponse.json();
        
        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'Failed to create payment intent');
        }
        
        setClientSecret(paymentData.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
        setLocation('/cart');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [match, params, setLocation, toast]);

  if (isLoading || !orderDetails) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>
              We couldn't initialize the payment process. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/cart')} className="w-full">
              Return to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Purchase</CardTitle>
            <CardDescription>
              Please provide your payment details to complete the order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm amount={orderDetails.amount} orderId={orderDetails.id} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}