import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Ingredient interface
interface Ingredient {
  id: number;
  name: string;
  description: string;
  benefits: string[];
  source: string;
  imageUrl: string;
  category: "botanical" | "vitamin" | "antioxidant" | "humectant" | "ceramide";
}

// Dummy ingredients data
const ingredients: Ingredient[] = [
  {
    id: 1,
    name: "Hyaluronic Acid",
    description: "A powerful humectant that can hold up to 1000 times its weight in water, helping to hydrate and plump the skin.",
    benefits: ["Hydration", "Plumping", "Smoothing fine lines"],
    source: "Can be derived from microbial fermentation or created synthetically",
    imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "humectant"
  },
  {
    id: 2,
    name: "Vitamin C",
    description: "A potent antioxidant that helps brighten skin, even skin tone, and protect against environmental damage.",
    benefits: ["Brightening", "Collagen production", "Antioxidant protection"],
    source: "Can be derived from citrus fruits or created synthetically",
    imageUrl: "https://images.unsplash.com/photo-1610478920392-95888fc6374b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "vitamin"
  },
  {
    id: 3,
    name: "Rosehip Oil",
    description: "Rich in vitamins, antioxidants and essential fatty acids that help hydrate and nourish the skin while reducing hyperpigmentation.",
    benefits: ["Hydration", "Reducing hyperpigmentation", "Anti-aging"],
    source: "Extracted from the seeds of rose bushes primarily grown in Chile",
    imageUrl: "https://images.unsplash.com/photo-1595456982104-14cc660c4d22?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "botanical"
  },
  {
    id: 4,
    name: "Niacinamide",
    description: "A form of vitamin B3 that helps improve skin barrier function, minimize pores, and reduce inflammation.",
    benefits: ["Reducing redness", "Minimizing pores", "Regulating oil production"],
    source: "Can be derived from yeast, liver, lean meats, or created synthetically",
    imageUrl: "https://images.unsplash.com/photo-1621232082743-f5a178401120?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "vitamin"
  },
  {
    id: 5,
    name: "Green Tea Extract",
    description: "Contains powerful antioxidants called catechins that help protect the skin from free radical damage and reduce inflammation.",
    benefits: ["Anti-inflammatory", "Antioxidant protection", "Oil regulation"],
    source: "Derived from the leaves of the Camellia sinensis plant",
    imageUrl: "https://images.unsplash.com/photo-1610897600804-c36e6d8b2ecb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "antioxidant"
  },
  {
    id: 6,
    name: "Ceramides",
    description: "Lipids naturally found in the skin that help maintain the skin barrier and retain moisture.",
    benefits: ["Barrier repair", "Hydration", "Protection"],
    source: "Can be derived from plants or created synthetically",
    imageUrl: "https://images.unsplash.com/photo-1556227834-09f1de7a7d14?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "ceramide"
  },
  {
    id: 7,
    name: "Bakuchiol",
    description: "A natural alternative to retinol that helps reduce fine lines and improve skin texture without the irritation often associated with retinol.",
    benefits: ["Anti-aging", "Improving skin texture", "Gentle on skin"],
    source: "Derived from the babchi plant (Psoralea corylifolia)",
    imageUrl: "https://images.unsplash.com/photo-1598346763242-7fbe5044af66?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "botanical"
  },
  {
    id: 8,
    name: "Glycerin",
    description: "A humectant that draws water into the outer layer of the skin, helping to maintain hydration.",
    benefits: ["Hydration", "Softening", "Barrier support"],
    source: "Can be derived from plants or created synthetically",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-abb99b3d429c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "humectant"
  }
];

export default function Ingredients() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // Filter ingredients by category
  const filteredIngredients = selectedCategory === "all" 
    ? ingredients 
    : ingredients.filter(ing => ing.category === selectedCategory);
  
  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-6">
        Our Ingredients
      </h1>
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
        Discover the carefully selected ingredients that make Plenaire products so effective. We believe in transparency 
        and quality, which is why we're proud to share detailed information about what goes into our formulations.
      </p>
      
      <Tabs defaultValue="all" className="max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>All</TabsTrigger>
          <TabsTrigger value="botanical" onClick={() => setSelectedCategory("botanical")}>Botanicals</TabsTrigger>
          <TabsTrigger value="vitamin" onClick={() => setSelectedCategory("vitamin")}>Vitamins</TabsTrigger>
          <TabsTrigger value="antioxidant" onClick={() => setSelectedCategory("antioxidant")}>Antioxidants</TabsTrigger>
          <TabsTrigger value="humectant" onClick={() => setSelectedCategory("humectant")}>Humectants</TabsTrigger>
          <TabsTrigger value="ceramide" onClick={() => setSelectedCategory("ceramide")}>Ceramides</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-0">
          {selectedIngredient ? (
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={selectedIngredient.imageUrl} 
                    alt={selectedIngredient.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start">
                    <h2 className="font-cormorant text-3xl font-light mb-4">{selectedIngredient.name}</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedIngredient(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Back to all
                    </Button>
                  </div>
                  <p className="text-gray-700 mb-6">{selectedIngredient.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-lg mb-3">Key Benefits</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedIngredient.benefits.map((benefit, index) => (
                        <li key={index} className="text-gray-700">{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Source</h3>
                    <p className="text-gray-700">{selectedIngredient.source}</p>
                  </div>
                  
                  <div className="mt-8">
                    <Button className="bg-rose-600 hover:bg-rose-700">
                      Find Products With This Ingredient
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredIngredients.map(ingredient => (
                <div 
                  key={ingredient.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedIngredient(ingredient)}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={ingredient.imageUrl} 
                      alt={ingredient.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{ingredient.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{ingredient.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Philosophy Section */}
      <section className="max-w-4xl mx-auto mt-24">
        <h2 className="font-cormorant text-3xl font-light text-center mb-8">Our Ingredient Philosophy</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-rose-50 p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-3">What We Include</h3>
            <p className="text-gray-700 mb-4">
              We carefully select ingredients that have proven efficacy backed by scientific research. Our formulations 
              combine the best of nature and science to deliver visible results without compromising on safety or sustainability.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Clinically-proven actives</li>
              <li>Sustainably sourced botanicals</li>
              <li>Skin-identical ingredients</li>
              <li>Gentle preservatives for safety</li>
            </ul>
          </div>
          <div className="bg-rose-50 p-6 rounded-lg">
            <h3 className="font-medium text-lg mb-3">What We Exclude</h3>
            <p className="text-gray-700 mb-4">
              We believe in formulating without ingredients that have potential concerns for human health or environmental impact. 
              Our "free from" list is based on scientific evidence rather than trends.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Synthetic fragrances</li>
              <li>Harsh sulfates (SLS/SLES)</li>
              <li>Parabens</li>
              <li>Phthalates</li>
              <li>Mineral oils</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}