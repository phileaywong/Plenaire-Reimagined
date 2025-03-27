import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User } from 'lucide-react';

// Article interface
interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  category: 'skincare' | 'wellness' | 'sustainability' | 'ingredients';
  featured?: boolean;
}

// Dummy articles data
const articles: Article[] = [
  {
    id: 1,
    title: 'The Importance of Double Cleansing for Healthy Skin',
    excerpt: 'Discover why two steps are better than one when it comes to achieving a truly clean canvas for your skincare routine.',
    content: 'Double cleansing is a skincare technique that involves using an oil-based cleanser followed by a water-based cleanser. This method ensures that both oil-soluble impurities (like makeup and sunscreen) and water-soluble impurities (like sweat and dirt) are effectively removed from your skin...',
    author: 'Emma Watson',
    date: 'June 15, 2023',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'skincare',
    featured: true
  },
  {
    id: 2,
    title: 'Mindful Beauty: The Connection Between Stress and Skin Health',
    excerpt: 'Exploring the powerful relationship between mental wellbeing and skin appearance, and how to address both for optimal results.',
    content: 'The mind-body connection is real, especially when it comes to skin health. Chronic stress triggers the release of cortisol, which can increase oil production, reduce immune function in the skin, and break down collagen...',
    author: 'Dr. Sarah Chen',
    date: 'May 28, 2023',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'wellness',
    featured: true
  },
  {
    id: 3,
    title: 'Our Commitment to Sustainable Packaging',
    excerpt: 'How Plenaire is working to minimize environmental impact through innovative packaging solutions.',
    content: 'At Plenaire, we believe that luxury and sustainability can coexist. Our journey toward more eco-friendly packaging began with a simple question: how can we deliver premium products while minimizing our environmental footprint?...',
    author: 'Thomas Reed',
    date: 'April 10, 2023',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'sustainability'
  },
  {
    id: 4,
    title: 'The Science Behind Our Formulations',
    excerpt: 'Learn about the research and development process that ensures each Plenaire product delivers results.',
    content: 'Creating effective skincare is not just about combining trendy ingredients—it is a science. At Plenaire, our formulation process begins with identifying specific skin concerns and researching the most effective, scientifically-backed ingredients to address them...',
    author: 'Dr. Michael Lin',
    date: 'March 15, 2023',
    readTime: '10 min',
    imageUrl: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'ingredients'
  },
  {
    id: 5,
    title: 'Seasonal Skincare: Adapting Your Routine for Summer',
    excerpt: 'Tips and product recommendations to keep your skin balanced during the warmer months.',
    content: 'As temperatures rise and humidity levels change, your skin needs evolve too. Summer presents unique challenges—increased oil production, sun exposure, and environmental stressors can all impact your skin appearance and health...',
    author: 'Olivia Parker',
    date: 'June 2, 2023',
    readTime: '7 min',
    imageUrl: 'https://images.unsplash.com/photo-1555820585-c5ae44394b79?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'skincare'
  },
  {
    id: 6,
    title: 'The Rise of Waterless Beauty Products',
    excerpt: 'How eliminating water from formulations creates more concentrated, effective and sustainable products.',
    content: 'Water is typically the first ingredient listed in many skincare products, sometimes making up 70-80% of the formula. While water does have benefits as a solvent, the rise of waterless or anhydrous formulations is changing the beauty landscape...',
    author: 'James Wilson',
    date: 'February 20, 2023',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'sustainability'
  },
  {
    id: 7,
    title: 'Ingredient Spotlight: Bakuchiol, The Natural Retinol Alternative',
    excerpt: 'Discovering the gentle yet effective plant-derived ingredient that is revolutionizing anti-aging skincare.',
    content: 'For those who find retinol too irritating or who prefer plant-based ingredients, bakuchiol represents an exciting alternative. Derived from the seeds and leaves of the Psoralea corylifolia plant, this ingredient has been used in traditional Ayurvedic and Chinese medicine for centuries...',
    author: 'Dr. Emma Thompson',
    date: 'January 12, 2023',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1598346763242-7fbe5044af66?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'ingredients'
  },
  {
    id: 8,
    title: 'Morning Rituals for Radiant Skin and Mind',
    excerpt: 'Building a holistic morning routine that nurtures both your complexion and mental wellbeing.',
    content: 'How you start your day sets the tone for what follows. A mindful morning ritual can transform not just how your skin looks, but how you feel. The connection between inner wellbeing and outer radiance is powerful...',
    author: 'Sophia Rodriguez',
    date: 'May 5, 2023',
    readTime: '5 min',
    imageUrl: 'https://images.unsplash.com/photo-1631556097177-e61a2253669e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'wellness'
  }
];

export default function Journal() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Filter articles by category and search query
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Featured articles for the hero section
  const featuredArticles = articles.filter(article => article.featured);
  
  if (selectedArticle) {
    return (
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedArticle(null)}
            className="mb-6 text-gray-500 hover:text-gray-700"
          >
            ← Back to Journal
          </Button>
          
          <h1 className="font-cormorant text-3xl md:text-4xl font-light mb-6">
            {selectedArticle.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-8 gap-6">
            <div className="flex items-center">
              <User size={16} className="mr-2" />
              <span>{selectedArticle.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{selectedArticle.date}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span>{selectedArticle.readTime} read</span>
            </div>
          </div>
          
          <div className="w-full h-[50vh] mb-8 rounded-lg overflow-hidden">
            <img 
              src={selectedArticle.imageUrl} 
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="prose prose-rose lg:prose-lg max-w-none">
            <p className="text-lg font-medium mb-6">{selectedArticle.excerpt}</p>
            <p className="mb-4">{selectedArticle.content}</p>
            <p>At Plenaire, we believe in a holistic approach to skincare that respects both your skin and the environment. Our products are formulated with carefully selected ingredients that work in harmony with your natural skin processes, promoting health and radiance from within.</p>
            <p>We are committed to transparency in everything we do, from ingredient sourcing to manufacturing processes. This article is part of our ongoing effort to educate and empower our community with the knowledge they need to make informed skincare decisions.</p>
            <p>Have questions about this topic? Feel free to reach out to our skincare experts for personalized advice and recommendations.</p>
          </div>
          
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-medium text-lg mb-6">More articles you might enjoy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles
                .filter(article => article.id !== selectedArticle.id)
                .slice(0, 2)
                .map(article => (
                  <div 
                    key={article.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <h4 className="font-medium group-hover:text-rose-600 transition-colors duration-200">{article.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{article.readTime} read</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-6">
        Plenaire Journal
      </h1>
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
        Explore our collection of articles on skincare, wellness, sustainability, and ingredient science. 
        Discover tips, insights, and the philosophy behind Plenaire.
      </p>
      
      {/* Featured Articles */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="mb-16">
          <h2 className="font-cormorant text-2xl font-light mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredArticles.map(article => (
              <div 
                key={article.id}
                className="bg-white rounded-lg overflow-hidden shadow-md cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-medium">
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-xl mb-2 group-hover:text-rose-600 transition-colors duration-200">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center">
                      <User size={14} className="mr-1" />
                      {article.author}
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {article.readTime} read
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-gray-200"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
            <TabsTrigger value="skincare" onClick={() => setSelectedCategory('skincare')}>Skincare</TabsTrigger>
            <TabsTrigger value="wellness" onClick={() => setSelectedCategory('wellness')}>Wellness</TabsTrigger>
            <TabsTrigger value="sustainability" onClick={() => setSelectedCategory('sustainability')}>Sustainability</TabsTrigger>
            <TabsTrigger value="ingredients" onClick={() => setSelectedCategory('ingredients')}>Ingredients</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="h-56 overflow-hidden">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
              </div>
              <div className="p-6">
                <div className="text-xs font-medium text-rose-600 mb-2">
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </div>
                <h3 className="font-medium text-lg mb-2 group-hover:text-rose-600 transition-colors duration-200">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{article.date}</span>
                  <span>{article.readTime} read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Newsletter */}
      <div className="mt-20 bg-rose-50 p-8 rounded-lg text-center">
        <h2 className="font-cormorant text-3xl font-light mb-4">
          Subscribe to Our Journal
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Stay updated with our latest articles, skincare tips, and exclusive offers. 
          Join our community of beauty enthusiasts and wellness seekers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your email address"
            className="h-12"
          />
          <Button className="bg-rose-600 hover:bg-rose-700 h-12">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}