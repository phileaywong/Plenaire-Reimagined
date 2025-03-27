import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

export default function ProductGrid() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  const [, setLocation] = useLocation();

  const handleViewAllProducts = () => {
    setLocation("/products");
  };

  return (
    <section id="products" className="py-16 md:py-24 px-6 md:px-10">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-cormorant font-light text-3xl md:text-5xl mb-4">
            Our Collection
          </h2>
          <p className="font-nunito max-w-2xl mx-auto">
            Discover our curated selection of mindful beauty products designed to
            enhance your everyday rituals
          </p>
          <button 
            onClick={() => setLocation("/products")}
            className="mt-6 inline-block bg-roseDark text-white font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-roseLight transition-colors duration-300 cursor-pointer"
          >
            Discover Our Products
          </button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="h-80 bg-gray-100 animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <button
            onClick={handleViewAllProducts}
            className="inline-block border border-darkText text-darkText font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-darkText hover:text-white transition-colors duration-300 cursor-pointer"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
