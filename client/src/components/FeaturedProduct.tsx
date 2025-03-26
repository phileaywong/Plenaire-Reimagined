import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";

export default function FeaturedProduct() {
  const { data: featuredProduct, isLoading } = useQuery<Product>({
    queryKey: ["/api/products/featured"],
  });

  if (isLoading || !featuredProduct) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-10 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 h-96 bg-gray-100 animate-pulse rounded-lg"></div>
            <div className="md:w-1/2 md:pl-16 space-y-4">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-10 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={featuredProduct.imageUrl}
              alt={featuredProduct.name}
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </motion.div>
          <motion.div
            className="md:w-1/2 md:pl-16"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-poppins text-xs uppercase tracking-widest text-roseLight mb-4 block">
              Featured Product
            </span>
            <h2 className="font-cormorant font-light text-3xl md:text-5xl mb-6">
              {featuredProduct.name}
            </h2>
            <p className="text-base md:text-lg mb-8 leading-relaxed">
              {featuredProduct.description}
            </p>
            <div className="flex items-center mb-8">
              <span className="font-poppins font-medium text-2xl mr-4">
                ${featuredProduct.price.toFixed(2)}
              </span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-roseDark fill-roseDark"
                  />
                ))}
                <span className="ml-2 text-sm">
                  ({featuredProduct.reviewCount} reviews)
                </span>
              </div>
            </div>
            <button className="bg-roseDark text-white font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-roseLight transition-colors duration-300 mr-4">
              Add to Cart
            </button>
            <button className="border border-darkText text-darkText font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-darkText hover:text-white transition-colors duration-300">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
