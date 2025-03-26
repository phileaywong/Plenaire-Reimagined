import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <Link href="/" className="z-10">
          <h1 className="font-cormorant font-light text-2xl md:text-3xl tracking-wider">
            PLENAIRE
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link href="/">
                <a className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300">
                  Shop
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#story">
                <a className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300">
                  Story
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#ingredients">
                <a className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300">
                  Ingredients
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#journal">
                <a className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300">
                  Journal
                </a>
              </Link>
            </li>
            <li>
              <Link href="/#contact">
                <a className="font-poppins text-sm uppercase tracking-wider hover:text-roseDark transition-colors duration-300">
                  Contact
                </a>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-4 z-10">
          <button className="hover:text-roseDark transition-colors duration-300">
            <Search size={18} />
          </button>
          <button className="hover:text-roseDark transition-colors duration-300">
            <User size={18} />
          </button>
          <button className="hover:text-roseDark transition-colors duration-300">
            <ShoppingBag size={18} />
          </button>
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
                <Link href="/">
                  <a
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Shop
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/#story">
                  <a
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Story
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/#ingredients">
                  <a
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Ingredients
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/#journal">
                  <a
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Journal
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <a
                    className="font-poppins text-lg uppercase tracking-wider hover:text-roseDark transition-colors duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
