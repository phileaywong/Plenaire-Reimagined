import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

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

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 py-4 px-6 md:px-10 ${
        isScrolled ? "header-scroll" : ""
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div onClick={() => setLocation("/")} className="z-10 cursor-pointer">
          <h1 className="font-cormorant font-light text-2xl md:text-3xl tracking-wider">
            PLENAIRE
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <span 
                onClick={() => setLocation("/")}
                className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
              >
                Shop
              </span>
            </li>
            <li>
              <span 
                onClick={() => setLocation("/our-story")}
                className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
              >
                Story
              </span>
            </li>
            <li>
              <span 
                onClick={() => setLocation("/ingredients")}
                className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
              >
                Ingredients
              </span>
            </li>
            <li>
              <span 
                onClick={() => setLocation("/journal")}
                className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
              >
                Journal
              </span>
            </li>
            <li>
              <span 
                onClick={() => setLocation("/contact-us")}
                className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
              >
                Contact
              </span>
            </li>
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4 z-10">
          <div 
            onClick={() => setLocation("/search")}
            className="hover:text-roseDark transition-colors duration-300 cursor-pointer"
          >
            <Search size={18} />
          </div>
          <div 
            onClick={() => setLocation("/account")}
            className="hover:text-roseDark transition-colors duration-300 cursor-pointer"
          >
            <User size={18} />
          </div>
          <div 
            onClick={() => setLocation("/cart")}
            className="hover:text-roseDark transition-colors duration-300 cursor-pointer"
          >
            <ShoppingBag size={18} />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden hover:text-roseDark transition-colors duration-300"
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
            >
              <X size={24} />
            </button>
            <ul className="flex flex-col space-y-6 items-center">
              <li>
                <span
                  className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setLocation("/");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Shop
                </span>
              </li>
              <li>
                <span
                  className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setLocation("/our-story");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Story
                </span>
              </li>
              <li>
                <span
                  className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setLocation("/ingredients");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Ingredients
                </span>
              </li>
              <li>
                <span
                  className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setLocation("/journal");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Journal
                </span>
              </li>
              <li>
                <span
                  className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setLocation("/contact-us");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Contact
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
