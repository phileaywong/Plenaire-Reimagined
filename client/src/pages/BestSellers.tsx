import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function BestSellers() {
  // Get all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Filter for "best sellers" - in a real app, this would be a specific API endpoint
  // For now, we'll simulate by taking the first 8 products
  const bestSellerProducts = products?.slice(0, 8);
  
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Best Sellers
      </h1>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
        Discover our most loved products. These customer favorites have earned their place in skincare routines around the world for their exceptional quality and remarkable results.
      </p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-80 bg-gray-100 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {bestSellerProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {/* Why These Products Are Best Sellers */}
      <div className="mt-24 mb-16">
        <h2 className="font-cormorant text-3xl font-light text-center mb-16">
          Why Our Customers Love These Products
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
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Effective Formulations</h3>
            <p className="text-gray-600">
              Our best sellers feature clinically-proven ingredients in optimal concentrations for visible results.
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
                <path d="M8.56 3.69a9 9 0 0 0-2.92 1.95" />
                <path d="M3.69 8.56A9 9 0 0 0 3 12" />
                <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
                <path d="M8.56 20.31A9 9 0 0 0 12 21" />
                <path d="M15.44 20.31a9 9 0 0 0 2.92-1.95" />
                <path d="M20.31 15.44A9 9 0 0 0 21 12" />
                <path d="M20.31 8.56a9 9 0 0 0-1.95-2.92" />
                <path d="M15.44 3.69A9 9 0 0 0 12 3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Sensorial Experience</h3>
            <p className="text-gray-600">
              Luxurious textures and subtle natural scents transform daily skincare into a pleasurable ritual.
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
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Universal Appeal</h3>
            <p className="text-gray-600">
              Suitable for all skin types and concerns, these products deliver remarkable results for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}