import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TravelSizes() {
  // Get all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // For a real app, this would be a specific API endpoint for travel sizes
  // For now, we'll simulate by using existing products
  
  // Group products into categories for the tabs
  // In a real app, this would come from the backend as pre-filtered data
  const cleansers = products.slice(0, 2);
  const serums = products.slice(0, 3);
  const moisturizers = products.slice(0, 2);
  
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Travel Sizes
      </h1>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
        Perfect for discovery, travel, or on-the-go skincare. Our travel sizes offer the same premium formulations in convenient, TSA-friendly packaging.
      </p>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 bg-gray-100 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-12">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="cleansers">Cleansers</TabsTrigger>
            <TabsTrigger value="serums">Serums</TabsTrigger>
            <TabsTrigger value="moisturizers">Moisturizers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Travel Size
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="cleansers" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cleansers.map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Travel Size
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="serums" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serums.map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Travel Size
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="moisturizers" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {moisturizers.map(product => (
                <div key={product.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Travel Size
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Travel Benefits Section */}
      <div className="mt-24">
        <h2 className="font-cormorant text-3xl font-light text-center mb-16">
          Benefits of Travel Sizes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M2 12h10" />
                <path d="M9 4v16" />
                <path d="M14 9h3" />
                <path d="M14 16h7" />
                <path d="M21 12h-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-3">TSA-Approved</h3>
            <p className="text-gray-600">
              All our travel sizes are under 3.4 oz (100ml), making them perfect for your carry-on luggage. No need to compromise on your skincare routine while traveling.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                <path d="M9 5V3" />
                <path d="M15 5V3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-3">Try Before You Commit</h3>
            <p className="text-gray-600">
              Travel sizes are perfect for testing new products without committing to a full-size purchase. Experience our formulations and see how they work for your skin.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                <path d="M7 7h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-3">Budget-Friendly</h3>
            <p className="text-gray-600">
              Our travel sizes offer excellent value, allowing you to experience luxury skincare at a more accessible price point. Perfect for those new to the brand.
            </p>
          </div>
        </div>
      </div>
      
      {/* Travel Kit Set */}
      <div className="mt-16 bg-gray-50 p-10 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Best Value</span>
            <h3 className="font-cormorant text-2xl font-light mt-2 mb-4">Complete Travel Kit</h3>
            <p className="text-gray-600 mb-6">
              Experience our complete skincare ritual in travel-friendly sizes. This kit includes our bestselling cleanser, toner, serum, moisturizer, and treatment mask—everything you need for radiant skin on the go.
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-8">
              <li>Perfect for 1-2 week trips</li>
              <li>Includes reusable travel pouch</li>
              <li>30% savings versus buying separately</li>
              <li>Ideal gift for the traveler</li>
            </ul>
            <button className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors">
              Shop Travel Kit
            </button>
          </div>
          <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
              alt="Travel Kit"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}