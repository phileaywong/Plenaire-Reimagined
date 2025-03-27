import { Link } from "wouter";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white pt-16 pb-8 px-6 md:px-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <h3 className="font-cormorant text-xl mb-6">PLENAIRE</h3>
            <p className="mb-6">
              Mindful beauty products designed with intention for your everyday
              rituals.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-roseDark transition-colors duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="hover:text-roseDark transition-colors duration-300"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="hover:text-roseDark transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
              </a>
              <a
                href="#"
                className="hover:text-roseDark transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                  <path d="M10 9a5 5 0 0 1 4 0" />
                  <path d="M13 21c-3.33 -3.5 -4 -6 -4 -9a5 5 0 1 1 10 0c0 3 -0.67 5.5 -4 9" />
                  <path d="M9.5 14.5l-1 2" />
                  <path d="M14.5 14.5l1 2" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-poppins uppercase text-sm tracking-wider mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    All Products
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/best-sellers">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Best Sellers
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    New Arrivals
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/gift-sets">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Gift Sets
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/travel-sizes">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Travel Sizes
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins uppercase text-sm tracking-wider mb-6">
              About
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/our-story">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Our Story
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/ingredients">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Ingredients
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/sustainability">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Sustainability
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/journal">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Journal
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/press">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Press
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins uppercase text-sm tracking-wider mb-6">
              Customer Care
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact-us">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Contact Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faqs">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    FAQs
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Shipping & Returns
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/track-order">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Track Your Order
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="hover:text-roseDark transition-colors duration-300">
                    Privacy Policy
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Plenaire. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/">
              <a className="hover:text-roseDark transition-colors duration-300">
                Terms of Service
              </a>
            </Link>
            <Link href="/">
              <a className="hover:text-roseDark transition-colors duration-300">
                Privacy Policy
              </a>
            </Link>
            <Link href="/">
              <a className="hover:text-roseDark transition-colors duration-300">
                Accessibility
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
