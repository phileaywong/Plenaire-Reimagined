import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";

export default function NewArrivals() {
  // Get all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Filter for "new arrivals" - in a real app, this would be a specific API endpoint
  // For now, we'll simulate by taking some random products
  const newArrivalsProducts = products?.slice(0, 6);
  
  return (
    <div className="container mx-auto px-4 py-32">
      <div className="flex flex-col items-center mb-16">
        <Badge className="mb-4">Just Launched</Badge>
        <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-4">
          New Arrivals
        </h1>
        <p className="text-center text-gray-600 max-w-2xl">
          Discover our latest innovations in skincare. These newly launched products represent our commitment to creating effective, mindful beauty solutions.
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {newArrivalsProducts.map(product => (
            <div key={product.id} className="relative">
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="secondary" className="bg-white/90 text-black">New</Badge>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
      
      {/* New Collection Features */}
      <div className="mt-24 mb-16">
        <h2 className="font-cormorant text-3xl font-light text-center mb-16">
          What Makes Our New Collection Special
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Innovative Ingredients</h3>
            <p className="text-gray-600 mb-4">
              Our new collection features cutting-edge botanical extracts and scientifically advanced compounds that deliver exceptional results.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Plant-derived peptides for enhanced collagen production</li>
              <li>Hyaluronic acid complexes for multi-layer hydration</li>
              <li>Antioxidant-rich botanical extracts</li>
              <li>Microbiome-supporting prebiotics</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Sustainable Packaging</h3>
            <p className="text-gray-600 mb-4">
              Our commitment to the environment is reflected in our thoughtfully designed packaging solutions.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Recyclable glass containers</li>
              <li>FSC-certified paper packaging</li>
              <li>Biodegradable shipping materials</li>
              <li>Refillable options for select products</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Coming Soon */}
      <div className="bg-primary/5 p-10 rounded-lg text-center mt-16">
        <h3 className="font-cormorant text-2xl font-light mb-4">Coming Soon</h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          Stay tuned for more exciting additions to our product line. Sign up for our newsletter to be the first to know about new launches and receive exclusive early access.
        </p>
        <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors">
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
}