import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentPage from "@/pages/PaymentPage";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Account from "@/pages/Account";
import Shop from "@/pages/Shop";
import Story from "@/pages/Story";
import Ingredients from "@/pages/Ingredients";
import Journal from "@/pages/Journal";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/products" component={Shop} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment/:id" component={PaymentPage} />
          <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
          <Route path="/account" component={Account} />
          <Route path="/our-story" component={Story} />
          <Route path="/ingredients" component={Ingredients} />
          <Route path="/journal" component={Journal} />
          <Route path="/contact-us" component={Contact} />
          <Route path="/search" component={Search} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
