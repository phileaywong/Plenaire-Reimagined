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
      console.log('Login attempt with email:', values.email);
      
      // Track if we need to refresh the captcha
      let needCaptchaRefresh = false;
      
      // Make the API request using fetch with credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      // Parse the response as JSON regardless of status
      const data = await response.json();
      console.log('Server login response:', response.status, data);
      
      // Handle error responses
      if (!response.ok) {
        let errorMessage = data.message || 'Something went wrong. Please try again.';
        
        // Special case for captcha requirements
        if (data.requireCaptcha) {
          errorMessage += ' Please enter the security code shown below.';
          needCaptchaRefresh = true;
        }
        
        toast({
          title: 'Login failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        // If we need to refresh the captcha, do that
        if (needCaptchaRefresh) {
          // Logic to refresh captcha could go here
          console.log('Captcha refresh needed');
        }
        
        return;
      }
      
      // Success handling
      console.log('Login successful - user data:', {
        id: data.id,
        email: data.email,
        role: data.role,
        roleType: typeof data.role
      });
      
      toast({
        title: 'Logged in',
        description: 'You have successfully logged in.',
      });
      
      // Reset form state
      form.reset();
      
      // Check if the user is an admin and redirect to admin page if so
      // Be very permissive in checking for admin role
      const adminValues = ['admin', 'ADMIN', 'Admin', '1', 1];
      const isAdmin = adminValues.includes(data.role) || data.email === 'admin@localhost.localdomain';
      
      if (isAdmin) {
        console.log('Admin user detected, redirecting to admin panel');
        setLocation('/admin');
      } else {
        // For regular users, go back to home or previous page
        setLocation('/');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login failed',
        description: 'Connection error. Please check your internet and try again.',
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