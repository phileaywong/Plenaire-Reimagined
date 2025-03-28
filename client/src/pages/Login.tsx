import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    
    try {
      // Make the API request but get the raw response first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      // Parse the response as JSON
      const data = await response.json();
      
      // Check if the response is successful
      if (!response.ok) {
        // Format an appropriate error message based on the response
        let errorMessage = data.message || 'Something went wrong. Please try again.';
        
        // Log for debugging
        console.log('Server response:', data);
        
        // Show appropriate error message
        toast({
          title: 'Login failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // Exit early
        return;
      }
      
      // Success case
      toast({
        title: 'Logged in',
        description: 'You have successfully logged in.',
      });
      
      // Check if the user is an admin and redirect to admin page if so
      if (data.role === 'admin') {
        console.log('Admin user detected, redirecting to admin panel');
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Fallback error message if something completely unexpected happened
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-md py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-light tracking-wide">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your Plenaire account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
                <div className="text-sm text-right">
                  <Link href="/forgot-password" className="text-muted-foreground hover:text-primary">
                    Forgot password?
                  </Link>
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}