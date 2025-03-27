import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [location, setLocation] = useLocation();
  
  // Get search query from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, []);
  
  // Search products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [searchQuery ? `/api/products/search?q=${searchQuery}` : '/api/products'],
    enabled: activeTab === "products",
  });
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search query
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
      setLocation(`/search?${params.toString()}`);
    } else {
      setLocation("/search");
    }
  };
  
  // Calculate result counts
  const productCount = products?.length || 0;
  // Mock counts for other categories since we don't have actual data for them
  const articleCount = searchQuery ? Math.floor(Math.random() * 5) : 0;
  const faqCount = searchQuery ? Math.floor(Math.random() * 3) : 0;
  
  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Search
      </h1>
      
      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search products, articles, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-gray-200"
            />
            <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
            Search
          </Button>
        </form>
      </div>
      
      {/* Tabs for Search Categories */}
      {searchQuery && (
        <>
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-8">
                <TabsTrigger value="products" className="relative">
                  Products
                  {productCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {productCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="articles" className="relative">
                  Articles
                  {articleCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {articleCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="faqs" className="relative">
                  FAQs
                  {faqCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {faqCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {/* Products Results */}
              <TabsContent value="products">
                {productsLoading ? (
                  <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-300"></div>
                  </div>
                ) : products && products.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-medium mb-6">
                      Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                      {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <h3 className="text-xl font-medium mb-2">No products found</h3>
                    <p className="text-gray-500">
                      We couldn't find any products matching "{searchQuery}".<br />
                      Try checking your spelling or using more general terms.
                    </p>
                    <Button 
                      className="mt-6"
                      onClick={() => setLocation("/products")}
                    >
                      Browse All Products
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Articles Results (Placeholder) */}
              <TabsContent value="articles">
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">
                    {articleCount > 0 
                      ? `Found ${articleCount} article${articleCount !== 1 ? 's' : ''} for "${searchQuery}"`
                      : "No articles found"
                    }
                  </h3>
                  <p className="text-gray-500">
                    {articleCount > 0 
                      ? "This is a placeholder for article search results."
                      : `We couldn't find any articles matching "${searchQuery}".`
                    }
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => setLocation("/journal")}
                  >
                    Browse Journal
                  </Button>
                </div>
              </TabsContent>
              
              {/* FAQs Results (Placeholder) */}
              <TabsContent value="faqs">
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">
                    {faqCount > 0 
                      ? `Found ${faqCount} FAQ${faqCount !== 1 ? 's' : ''} for "${searchQuery}"`
                      : "No FAQs found"
                    }
                  </h3>
                  <p className="text-gray-500">
                    {faqCount > 0 
                      ? "This is a placeholder for FAQ search results."
                      : `We couldn't find any FAQs matching "${searchQuery}".`
                    }
                  </p>
                  <Button 
                    className="mt-6"
                    onClick={() => setLocation("/contact-us")}
                  >
                    Contact Us
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Popular Searches */}
          <div className="max-w-4xl mx-auto mt-16 p-8 bg-gray-50 rounded-lg">
            <h3 className="text-center font-medium text-lg mb-4">Popular Searches</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {["Rose Jelly", "Moisturizer", "Serum", "Facial Cleanser", "Night Cream", "Vitamin C"].map(term => (
                <Button 
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    const params = new URLSearchParams();
                    params.set("q", term);
                    setLocation(`/search?${params.toString()}`);
                  }}
                  className="rounded-full"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Initial State - No Search Query */}
      {!searchQuery && (
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-medium mb-4">What are you looking for?</h2>
          <p className="text-gray-600 mb-8">
            Enter keywords above to search our products, articles, and FAQs. You can search by product name,
            ingredients, skin concerns, or any other keyword relevant to your needs.
          </p>
          
          <h3 className="font-medium mb-3">Or browse our categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setLocation("/products")}
              className="h-auto py-4 flex flex-col items-center"
            >
              <span className="text-lg mb-1">Products</span>
              <span className="text-xs text-gray-500">Browse our collection</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation("/ingredients")}
              className="h-auto py-4 flex flex-col items-center"
            >
              <span className="text-lg mb-1">Ingredients</span>
              <span className="text-xs text-gray-500">Explore our formulations</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation("/journal")}
              className="h-auto py-4 flex flex-col items-center"
            >
              <span className="text-lg mb-1">Journal</span>
              <span className="text-xs text-gray-500">Read our articles</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}