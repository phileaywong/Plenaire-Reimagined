import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, ShoppingBag } from "lucide-react";

export default function GiftSets() {
  const { toast } = useToast();
  
  // Get all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // For now, we'll simulate gift sets by grouping existing products
  // In a real app, this would be a separate API endpoint
  const giftSets = [
    {
      id: 1,
      name: "Essential Skincare Set",
      description: "A complete daily routine with our most loved products for all skin types.",
      price: 120.00,
      savings: "Save 20%",
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      products: products.slice(0, 3)
    },
    {
      id: 2,
      name: "Hydration Collection",
      description: "Everything you need for deeply hydrated, plump skin, perfect for dry or dehydrated skin types.",
      price: 95.00,
      savings: "Save 15%",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      products: products.slice(1, 4)
    },
    {
      id: 3,
      name: "Radiance Ritual",
      description: "A luxury set designed to reveal your skin's natural glow and target uneven skin tone.",
      price: 150.00,
      savings: "Save 25%",
      imageUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
      products: products.slice(2, 5)
    }
  ];
  
  // Function to add a gift set to cart
  const addToCart = async (giftSetId: number) => {
    try {
      // Get the gift set based on the ID
      const giftSet = giftSets.find(set => set.id === giftSetId);
      
      if (!giftSet || !giftSet.products.length) {
        throw new Error('Gift set not found or has no products');
      }
      
      // Add each product in the gift set to the cart
      // We use Promise.all to wait for all requests to complete
      await Promise.all(
        giftSet.products.map(product => 
          apiRequest('POST', '/api/cart/items', {
            productId: product.id,
            quantity: 1
          })
        )
      );
      
      // Invalidate cart query to refresh the cart state
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: `${giftSet.name} added to cart`,
        description: "Your gift set has been added to your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add gift set to cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to add a gift set to wishlist
  const addToWishlist = async (giftSetId: number) => {
    try {
      // Get the gift set based on the ID
      const giftSet = giftSets.find(set => set.id === giftSetId);
      
      if (!giftSet || !giftSet.products.length) {
        throw new Error('Gift set not found or has no products');
      }

      // Add each product in the gift set to the wishlist
      // We use Promise.all to wait for all requests to complete
      await Promise.all(
        giftSet.products.map(product => 
          apiRequest('POST', '/api/wishlist', {
            productId: product.id,
          })
        )
      );
      
      // Invalidate wishlist query to refresh the wishlist state
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      
      toast({
        title: `${giftSet.name} added to wishlist`,
        description: "Gift set has been added to your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add to wishlist. Please try again or log in.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Gift Sets
      </h1>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
        Curated collections of our finest products, thoughtfully packaged for gifting or as a special treat for yourself. Each set offers exceptional value with savings on individual product prices.
      </p>
      
      {isLoading ? (
        <div className="space-y-12">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
              <div className="h-80 bg-gray-100"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {giftSets.map(giftSet => (
            <div key={giftSet.id} className="bg-white rounded-lg overflow-hidden shadow border">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-full">
                  <img 
                    src={giftSet.imageUrl} 
                    alt={giftSet.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-cormorant mb-2">{giftSet.name}</h2>
                      <Badge variant="outline" className="text-primary font-medium">
                        {giftSet.savings}
                      </Badge>
                    </div>
                    <div className="text-xl font-medium">${giftSet.price.toFixed(2)}</div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {giftSet.description}
                  </p>
                  
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Includes:</h3>
                    <ul className="space-y-4">
                      {giftSet.products.map(product => (
                        <li key={product.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.description.length > 60 
                                ? product.description.substring(0, 60) + '...' 
                                : product.description}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={() => addToCart(giftSet.id)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => addToWishlist(giftSet.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Gift Information */}
      <div className="mt-24 mb-16">
        <h2 className="font-cormorant text-3xl font-light text-center mb-16">
          The Perfect Gift
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Thoughtfully Curated</h3>
            <p className="text-gray-600">
              Each set is expertly designed to work in perfect harmony, creating an effective skincare ritual.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="M12 4v16" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Beautifully Packaged</h3>
            <p className="text-gray-600">
              Our elegant gift boxes make a stunning presentation, requiring no additional wrapping.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Special Value</h3>
            <p className="text-gray-600">
              Each set offers significant savings compared to purchasing each product individually.
            </p>
          </div>
        </div>
      </div>
      
      {/* Personalized Gift Message */}
      <div className="bg-gray-50 p-8 rounded-lg text-center mt-16">
        <h3 className="font-cormorant text-2xl font-light mb-4">Add a Personal Touch</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Make your gift extra special with a personalized message. During checkout, you'll have the option to add a custom note that will be elegantly printed on a card and included with your gift set.
        </p>
      </div>
    </div>
  );
}