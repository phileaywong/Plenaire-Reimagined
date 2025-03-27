import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CartItem, Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "./auth/AuthModal";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Get cart items count for the cart icon
  const { data: cartItems } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/cart', { credentials: 'include' });
        if (res.ok) {
          return res.json();
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch cart data:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate cart items count
  const cartItemsCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavigation = (path: string) => {
    setLocation(path);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Handle user account navigation with auth check
  const handleAccountNavigation = () => {
    if (user) {
      // User is authenticated, navigate to account page
      handleNavigation("/account");
    } else {
      // User is not authenticated, open auth modal
      setIsAuthModalOpen(true);
    }
  };

  // Helper function to highlight active nav item
  const getNavItemClass = (path: string) => {
    const isActive = location === path;
    return `font-poppins text-sm uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
      isActive ? 'text-roseDark font-medium' : 'hover:text-roseDark'
    }`;
  };

  return (
    <>
      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 py-4 px-6 md:px-10 ${
          isScrolled ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <div onClick={() => handleNavigation("/")} className="z-10 cursor-pointer">
            <h1 className="font-cormorant font-light text-2xl md:text-3xl tracking-wider">
              PLENAIRE
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <button 
                  onClick={() => handleNavigation("/products")}
                  className={getNavItemClass("/products")}
                >
                  Shop
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation("/our-story")}
                  className={getNavItemClass("/our-story")}
                >
                  Story
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation("/ingredients")}
                  className={getNavItemClass("/ingredients")}
                >
                  Ingredients
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation("/journal")}
                  className={getNavItemClass("/journal")}
                >
                  Journal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation("/contact-us")}
                  className={getNavItemClass("/contact-us")}
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4 z-10">
            <button 
              onClick={() => handleNavigation("/search")}
              className="hover:text-roseDark transition-colors duration-300 cursor-pointer"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button 
              onClick={handleAccountNavigation}
              className="hover:text-roseDark transition-colors duration-300 cursor-pointer"
              aria-label="Account"
            >
              <User size={18} />
            </button>
            <button 
              onClick={() => handleNavigation("/cart")}
              className="hover:text-roseDark transition-colors duration-300 cursor-pointer relative"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-roseDark text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden hover:text-roseDark transition-colors duration-300"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-6 right-6 text-2xl"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              <ul className="flex flex-col space-y-6 items-center">
                <li>
                  <button
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                    onClick={() => handleNavigation("/products")}
                  >
                    Shop
                  </button>
                </li>
                <li>
                  <button
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                    onClick={() => handleNavigation("/our-story")}
                  >
                    Story
                  </button>
                </li>
                <li>
                  <button
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                    onClick={() => handleNavigation("/ingredients")}
                  >
                    Ingredients
                  </button>
                </li>
                <li>
                  <button
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                    onClick={() => handleNavigation("/journal")}
                  >
                    Journal
                  </button>
                </li>
                <li>
                  <button
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                    onClick={() => handleNavigation("/contact-us")}
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
