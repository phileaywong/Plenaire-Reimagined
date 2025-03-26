import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      className="product-card group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/products/${product.id}`}>
        <a className="block">
          <div className="product-image relative overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="image-overlay absolute inset-0 bg-roseDark bg-opacity-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="absolute top-4 right-4">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-roseLight hover:text-white transition-colors duration-300">
                <Heart size={18} />
              </button>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-cormorant font-medium text-xl mb-2">
              {product.name}
            </h3>
            <div className="flex justify-between items-center">
              <span className="font-poppins font-medium">
                ${product.price.toFixed(2)}
              </span>
              <button className="text-sm uppercase tracking-wider text-roseDark hover:underline transition-all duration-300">
                Add to Cart
              </button>
            </div>
          </div>
        </a>
      </Link>
    </motion.div>
  );
}
