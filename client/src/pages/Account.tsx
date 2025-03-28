import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { User, CreditCard, MapPin, Package, Heart, LogOut } from 'lucide-react';

import AccountAddresses from '../components/account/AccountAddresses';
import AccountOrders from '../components/account/AccountOrders';
import AccountProfile from '../components/account/AccountProfile';
import AccountWishlist from '../components/account/AccountWishlist';

export default function Account() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Fetch full user data to ensure they're logged in
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/auth/me');
        const data = await res.json();
        console.log("Fetched user data:", data);
        return data;
      } catch (error) {
        if (error instanceof Response && error.status === 401) {
          setLocation('/login');
        }
        throw error;
      }
    },
  });
  
  useEffect(() => {
    if (error) {
      setLocation('/login');
    }
  }, [error, setLocation]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-light tracking-wider uppercase text-neutral-700">My Account</h1>
        <p className="text-muted-foreground mt-2 text-sm font-light">Manage your profile, orders, and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Card className="p-4">
            <div className="space-y-1 mb-6">
              <h2 className="font-medium text-lg">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            
            <nav className="space-y-1">
              <Button 
                variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('orders')}
              >
                <Package className="mr-2 h-4 w-4" />
                Orders
              </Button>
              
              <Button 
                variant={activeTab === 'addresses' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Addresses
              </Button>
              
              <Button 
                variant={activeTab === 'wishlist' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart className="mr-2 h-4 w-4" />
                Wishlist
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </nav>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
            <AccountProfile user={user} />
          </div>
          
          <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
            <AccountOrders />
          </div>
          
          <div className={activeTab === 'addresses' ? 'block' : 'hidden'}>
            <AccountAddresses />
          </div>
          
          <div className={activeTab === 'wishlist' ? 'block' : 'hidden'}>
            <AccountWishlist />
          </div>
        </div>
      </div>
    </div>
  );
}