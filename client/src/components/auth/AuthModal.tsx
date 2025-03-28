import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const loginSchema = z.object({
  username: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  captcha: z.string().optional(),
});

const registerSchema = z.object({
  username: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>('login');
  const { loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string>('');
  const [isFetchingCaptcha, setIsFetchingCaptcha] = useState(false);

  // Dynamic login schema based on captcha visibility
  const currentLoginSchema = useMemo(() => {
    return showCaptcha 
      ? loginSchema.extend({ 
          captcha: z.string().min(1, "Security code is required") 
        })
      : loginSchema;
  }, [showCaptcha]);

  // Login form with dynamic validation
  const loginForm = useForm<LoginFormData & { captcha?: string }>({
    resolver: zodResolver(currentLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
    },
    mode: 'onSubmit',
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });
  
  // Initialize captcha if needed (e.g., when login page is opened from a failed attempt)
  useEffect(() => {
    if (open && activeTab === 'login') {
      // Check if there's any query param or session store indication that captcha should be shown
      const shouldShowCaptcha = window.sessionStorage.getItem('showLoginCaptcha') === 'true';
      if (shouldShowCaptcha) {
        fetchCaptcha();
      }
    }
  }, [open, activeTab]);

  // Function to fetch captcha
  const fetchCaptcha = async () => {
    try {
      setIsFetchingCaptcha(true);
      const res = await fetch('/api/auth/captcha');
      const data = await res.json();
      setCaptchaValue(data.captcha);
      setShowCaptcha(true);
    } catch (error) {
      console.error('Error fetching captcha:', error);
      toast({
        title: 'Error',
        description: 'Failed to load captcha. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingCaptcha(false);
    }
  };

  const onLoginSubmit = async (data: LoginFormData & { captcha?: string }) => {
    try {
      await loginMutation.mutateAsync(data);
      // Success! Clear any previous session flags
      window.sessionStorage.removeItem('showLoginCaptcha');
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      onOpenChange(false);
      navigate('/account');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Display user-friendly error message
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      
      // Check if captcha is required from the backend
      if ((error as any).requireCaptcha || 
          (error.message && (error.message.includes('Security code') || 
                             error.message.includes('attempt'))) && 
          !showCaptcha) {
        // Mark in session storage that captcha should be shown on next login attempt
        window.sessionStorage.setItem('showLoginCaptcha', 'true');
        fetchCaptcha();
      }
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
      onOpenChange(false);
      navigate('/account');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Display user-friendly error message
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle dialog closing
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset form states when closing the dialog
      loginForm.reset();
      registerForm.reset();
      setShowCaptcha(false);
      setCaptchaValue('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif tracking-wider">
            PLENAIRE
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Please sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="pt-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="********" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCaptcha && (
                  <div className="space-y-3">
                    <FormField
                      control={loginForm.control}
                      name="captcha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Code</FormLabel>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-100 p-2 rounded text-lg font-mono">
                                {isFetchingCaptcha ? 'Loading...' : captchaValue}
                              </div>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon" 
                                onClick={fetchCaptcha}
                                disabled={isFetchingCaptcha}
                              >
                                <RefreshCw className={`h-4 w-4 ${isFetchingCaptcha ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                            <FormControl>
                              <Input 
                                placeholder="Enter the code above" 
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      For your security, please enter the code shown above.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register" className="pt-4">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Create a password" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}