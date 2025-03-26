import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, ArrowLeft } from "lucide-react";
import { Product } from "@/lib/types";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (isLoading || !product) {
    return (
      <div className="container mx-auto py-32 px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2 h-96 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-24 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 w-full md:w-2/3 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-32 px-6 md:px-10">
      <Link href="/">
        <a className="inline-flex items-center text-darkText hover:text-roseDark transition-colors duration-300 mb-8">
          <ArrowLeft size={18} className="mr-2" />
          Back to products
        </a>
      </Link>
      
      <div className="flex flex-col md:flex-row gap-10">
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </motion.div>
        
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-cormorant font-light text-3xl md:text-5xl mb-4">{product.name}</h1>
          <div className="flex items-center mb-6">
            <div className="flex mr-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-roseDark fill-roseDark" />
              ))}
            </div>
            <span className="text-sm">({product.reviewCount} reviews)</span>
          </div>
          
          <p className="text-lg mb-8">{product.description}</p>
          
          <span className="font-poppins font-medium text-2xl block mb-8">${product.price.toFixed(2)}</span>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button className="bg-roseDark text-white font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-roseLight transition-colors duration-300">
              Add to Cart
            </button>
            <button className="border border-darkText text-darkText font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-darkText hover:text-white transition-colors duration-300">
              Add to Wishlist
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-8">
            <h3 className="font-cormorant font-medium text-xl mb-4">Key Ingredients</h3>
            <ul className="list-disc pl-5 space-y-2">
              {product.ingredients?.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
