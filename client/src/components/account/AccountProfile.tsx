import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Profile form schema
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface AccountProfileProps {
  user?: User;
}

export default function AccountProfile({ user }: AccountProfileProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Create profileForm
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });
  
  // Query to get full user details for profile
  const { data: fullUserData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/me');
      const data = await res.json();
      console.log("Fetched full user profile:", data);
      return data;
    },
    enabled: !!user,
  });
  
  // Update form values when user data changes
  useEffect(() => {
    // Use the full user data from our query if available
    const userData = fullUserData || user;
    
    if (userData) {
      console.log("Setting form values with user data:", userData);
      profileForm.reset({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
      });
    }
  }, [user, fullUserData, profileForm]);
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      console.log("Sending profile update:", values);
      const response = await apiRequest('PUT', '/api/auth/profile', values);
      const data = await response.json();
      console.log("Profile update response:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Force a refetch of the user data by invalidating the query cache
      import('@/lib/queryClient').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      console.log("Sending password update");
      const response = await apiRequest('PUT', '/api/auth/password', values);
      const data = await response.json();
      console.log("Password update response:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      console.error("Password update error:", error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update your password. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-xs text-muted-foreground">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}