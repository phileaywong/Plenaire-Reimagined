import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentPage from "@/pages/PaymentPage";
import StripeCheckout from "@/pages/StripeCheckout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Account from "@/pages/Account";
import Shop from "@/pages/Shop";
import Products from "@/pages/Products";
import Story from "@/pages/Story";
import Ingredients from "@/pages/Ingredients";
import Journal from "@/pages/Journal";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import FAQs from "@/pages/FAQs";
import ShippingReturns from "@/pages/ShippingReturns";
import TrackOrder from "@/pages/TrackOrder";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import BestSellers from "@/pages/BestSellers";
import NewArrivals from "@/pages/NewArrivals";
import GiftSets from "@/pages/GiftSets";
import TravelSizes from "@/pages/TravelSizes";
import Sustainability from "@/pages/Sustainability";
import Press from "@/pages/Press";
import AdminPage from "@/pages/admin/AdminPage";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const isAdminRoute = location.startsWith('/admin');

  // Log current routing state for debugging
  console.log("Router - Current location:", location);
  console.log("Router - isAdminRoute:", isAdminRoute);
  console.log("Router - User:", user ? `ID: ${user.id}, Role: ${user.role || 'none'}` : 'Not logged in');

  // If we're on an admin route, render the admin layout
  if (isAdminRoute) {
    // Enhanced logging for admin route debugging
    console.log("Rendering admin route with user:", {
      isLoading,
      isAuthenticated: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      isAdmin: user?.role === 'admin' || user?.email === 'admin@localhost.localdomain'
    });
    
    // Admin routes should not have the regular header/footer
    return (
      <div className="flex flex-col min-h-screen">
        <Switch>
          <Route path="/admin" component={AdminPage} />
          {/* Add additional admin routes here if needed */}
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }

  // Regular layout for non-admin routes
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/products" component={Products} />
          <Route path="/shop" component={Shop} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment/:id" component={PaymentPage} />
          <Route path="/stripe-checkout" component={StripeCheckout} />
          <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
          <Route path="/account" component={Account} />
          <Route path="/account/addresses" component={Account} />
          <Route path="/account/orders" component={Account} />
          <Route path="/account/wishlist" component={Account} />
          <Route path="/our-story" component={Story} />
          <Route path="/ingredients" component={Ingredients} />
          <Route path="/journal" component={Journal} />
          <Route path="/contact-us" component={Contact} />
          <Route path="/search" component={Search} />
          <Route path="/faqs" component={FAQs} />
          <Route path="/shipping-returns" component={ShippingReturns} />
          <Route path="/track-order" component={TrackOrder} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/best-sellers" component={BestSellers} />
          <Route path="/new-arrivals" component={NewArrivals} />
          <Route path="/gift-sets" component={GiftSets} />
          <Route path="/travel-sizes" component={TravelSizes} />
          <Route path="/sustainability" component={Sustainability} />
          <Route path="/press" component={Press} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
