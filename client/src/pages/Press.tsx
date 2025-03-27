import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Press release type
interface PressRelease {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  link: string;
}

// Media mention type
interface MediaMention {
  id: number;
  publication: string;
  title: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  link: string;
}

export default function Press() {
  const [filter, setFilter] = useState<string>("all");
  
  // Mock press releases data
  const pressReleases: PressRelease[] = [
    {
      id: 1,
      title: "Plenaire Launches Revolutionary Sustainable Packaging Initiative",
      date: "March 15, 2025",
      excerpt: "Plenaire announces a groundbreaking commitment to 100% recyclable or biodegradable packaging by the end of 2025, setting a new standard for sustainability in the beauty industry.",
      category: "Sustainability",
      imageUrl: "https://images.unsplash.com/photo-1611269154421-162e7bd28a1c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    },
    {
      id: 2,
      title: "Introducing Plenaire's Innovative Serum Collection",
      date: "February 8, 2025",
      excerpt: "Plenaire expands its skincare line with three new advanced serums designed to address specific skin concerns using cutting-edge ingredient technology and sustainable formulations.",
      category: "Product Launch",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      link: "#"
    },
    {
      id: 3,
      title: "Plenaire Announces Partnership with Global Reforestation Initiative",
      date: "January 22, 2025",
      excerpt: "In line with its commitment to environmental stewardship, Plenaire partners with the Global Reforestation Initiative to plant one tree for every product sold online.",
      category: "Sustainability",
      imageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    },
    {
      id: 4,
      title: "Plenaire Celebrates Opening of Flagship Store in New York",
      date: "December 5, 2024",
      excerpt: "Plenaire opens its first flagship store in SoHo, New York, offering an immersive retail experience that showcases the brand's commitment to mindful beauty and sustainability.",
      category: "Company News",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    }
  ];
  
  // Mock media mentions data
  const mediaMentions: MediaMention[] = [
    {
      id: 1,
      publication: "Vogue",
      title: "The Clean Beauty Brands Setting New Standards for Sustainability",
      date: "March 10, 2025",
      excerpt: "Plenaire stands out among a new generation of beauty brands that prioritize both efficacy and environmental responsibility, proving that luxury and sustainability can go hand in hand.",
      imageUrl: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    },
    {
      id: 2,
      publication: "Harper's Bazaar",
      title: "The 10 Best Serums for Radiant Skin in 2025",
      date: "February 15, 2025",
      excerpt: "Plenaire's new Radiance Activating Serum earns a top spot in our annual roundup, with editors praising its lightweight texture and impressive results on all skin types.",
      imageUrl: "https://images.unsplash.com/photo-1629386618049-4ce8dda2a1f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    },
    {
      id: 3,
      publication: "Allure",
      title: "Plenaire Wins 'Best Sustainable Beauty Brand' in Allure's Annual Beauty Awards",
      date: "January 30, 2025",
      excerpt: "In recognition of its innovative formulations and commitment to sustainable practices, Plenaire takes home the coveted award for Best Sustainable Beauty Brand of the year.",
      imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      link: "#"
    },
    {
      id: 4,
      publication: "Forbes",
      title: "The Beauty Industry Disruptors: Brands That Are Changing the Game",
      date: "December 12, 2024",
      excerpt: "Plenaire is featured as one of the top disruptors in the beauty industry, commended for its transparent supply chain, innovative formulations, and dedication to environmental causes.",
      imageUrl: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
      link: "#"
    },
    {
      id: 5,
      publication: "The New York Times",
      title: "How These Beauty Founders Are Reshaping Industry Standards",
      date: "November 5, 2024",
      excerpt: "In an in-depth profile, Plenaire's founder discusses the brand's journey and vision for a more sustainable, transparent, and inclusive beauty industry.",
      imageUrl: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80",
      link: "#"
    }
  ];
  
  // Filter press releases by category
  const filteredPressReleases = filter === "all" 
    ? pressReleases 
    : pressReleases.filter(release => release.category === filter);
  
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Press
      </h1>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
        Stay updated with the latest news, announcements, and media coverage about Plenaire. For press inquiries, please contact <a href="mailto:press@plenaire.com" className="text-primary hover:underline">press@plenaire.com</a>.
      </p>
      
      <Tabs defaultValue="press-releases" className="w-full mb-12">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="press-releases">Press Releases</TabsTrigger>
          <TabsTrigger value="media-mentions">Media Mentions</TabsTrigger>
        </TabsList>
        
        {/* Press Releases Tab */}
        <TabsContent value="press-releases" className="mt-10">
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "Product Launch" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("Product Launch")}
            >
              Product Launch
            </Button>
            <Button 
              variant={filter === "Sustainability" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("Sustainability")}
            >
              Sustainability
            </Button>
            <Button 
              variant={filter === "Company News" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("Company News")}
            >
              Company News
            </Button>
          </div>
          
          {filteredPressReleases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No press releases found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPressReleases.map(release => (
                <div key={release.id} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={release.imageUrl} 
                      alt={release.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white text-primary hover:bg-white/90">
                        {release.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">{release.date}</div>
                    <h3 className="text-xl font-medium mb-3">{release.title}</h3>
                    <p className="text-gray-600 mb-4">{release.excerpt}</p>
                    <a href={release.link} className="text-primary font-medium hover:underline">
                      Read More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Media Mentions Tab */}
        <TabsContent value="media-mentions" className="mt-10">
          <div className="space-y-8">
            {mediaMentions.map(mention => (
              <div key={mention.id} className="flex flex-col md:flex-row gap-6 border-b pb-8">
                <div className="md:w-1/3">
                  <img 
                    src={mention.imageUrl} 
                    alt={mention.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {mention.publication}
                    </Badge>
                    <span className="text-sm text-gray-500">{mention.date}</span>
                  </div>
                  <h3 className="text-xl font-medium mb-3">{mention.title}</h3>
                  <p className="text-gray-600 mb-4">{mention.excerpt}</p>
                  <a href={mention.link} className="text-primary font-medium hover:underline">
                    Read the full article
                  </a>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-16" />
      
      {/* Press Kit Section */}
      <section className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-cormorant font-light mb-6">Press Kit</h2>
        <p className="text-gray-600 mb-8">
          Download our press kit for brand assets, product images, and company information.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="flex-1 max-w-xs mx-auto">Download Press Kit</Button>
          <Button variant="outline" className="flex-1 max-w-xs mx-auto">View Brand Guidelines</Button>
        </div>
      </section>
      
      {/* Press Contact */}
      <section className="mt-20 bg-gray-50 p-10 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-3xl font-cormorant font-light mb-6 text-center">Press Contact</h2>
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            For press inquiries, interview requests, or to be added to our press list:
          </p>
          <p className="mb-6">
            <strong>Emma Thompson</strong><br />
            Head of Public Relations<br />
            <a href="mailto:press@plenaire.com" className="text-primary hover:underline">press@plenaire.com</a><br />
            +1 (555) 123-4567
          </p>
          <Button variant="outline">Contact Press Team</Button>
        </div>
      </section>
    </div>
  );
}