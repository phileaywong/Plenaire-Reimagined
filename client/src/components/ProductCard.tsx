import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", "/api/wishlist", {
        productId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
      });
    },
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Please login first",
          description: "You need to be logged in to add items to wishlist",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Failed to add to wishlist",
          description: "There was an error adding this product to your wishlist",
          variant: "destructive",
        });
      }
    }
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("POST", "/api/cart/items", {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    },
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Please login first",
          description: "You need to be logged in to add items to cart",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Failed to add product",
          description: "There was an error adding this product to your cart",
          variant: "destructive",
        });
      }
    }
  });

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToWishlistMutation.mutate(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCartMutation.mutate(product.id);
  };

  const navigateToProduct = () => {
    setLocation(`/products/${product.id}`);
  };

  return (
    <motion.div
      className="product-card group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onClick={navigateToProduct}
    >
      <div className="cursor-pointer">
        <div className="product-image relative overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="image-overlay absolute inset-0 bg-roseDark bg-opacity-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="absolute top-4 right-4">
            <button 
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-roseLight hover:text-white transition-colors duration-300"
              onClick={handleAddToWishlist}
              disabled={addToWishlistMutation.isPending}
            >
              <Heart size={18} className={addToWishlistMutation.isPending ? "animate-pulse" : ""} />
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
            <button 
              className="text-sm uppercase tracking-wider text-roseDark hover:underline transition-all duration-300"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
