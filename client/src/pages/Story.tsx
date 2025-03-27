import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Story() {
  const [, setLocation] = useLocation();
  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-12">
          Our Story
        </h1>
        
        {/* Hero Image */}
        <div className="w-full h-[60vh] rounded-lg overflow-hidden mb-16">
          <img 
            src="https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80" 
            alt="Plenaire Story"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Our Beginning */}
        <section className="mb-20">
          <h2 className="font-cormorant text-3xl font-light mb-6">Our Beginning</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Plenaire (French for "open air") began with a simple idea: skincare should be as pure and refreshing as the outdoors. 
            Founded in 2019, our brand has grown from a passion project into a global community of like-minded individuals 
            who believe skincare should enhance the skin's natural ability to protect and regenerate.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our journey started in a small laboratory in Paris, where our founder, working alongside leading chemists, 
            developed formulations that harness nature's most effective ingredients while respecting the skin's delicate ecosystem. 
            What began as a pursuit of personal wellness quickly evolved into a mission to transform the beauty industry with 
            transparency, sustainability, and effectiveness at its core.
          </p>
        </section>
        
        {/* Our Philosophy */}
        <section className="mb-20">
          <h2 className="font-cormorant text-3xl font-light mb-6">Our Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-rose-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-3">Simplicity</h3>
              <p className="text-gray-700">We believe in skincare that's simple yet effective, eliminating unnecessary ingredients and focusing on what truly works.</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-3">Transparency</h3>
              <p className="text-gray-700">Every ingredient serves a purpose, and we're committed to explaining exactly what that purpose is.</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-3">Sustainability</h3>
              <p className="text-gray-700">Our commitment to the planet is reflected in our packaging, ingredients, and business practices.</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">
            At Plenaire, we don't believe in quick fixes or miracle solutions. Instead, we advocate for a holistic approach to 
            skincare that encompasses how you treat your skin, what you put in your body, and how you manage stress and emotions. 
            Our products are designed to support this philosophy, offering gentle yet effective care that works with your skin, not against it.
          </p>
        </section>
        
        {/* Team */}
        <section className="mb-20">
          <h2 className="font-cormorant text-3xl font-light mb-6">The Team Behind Plenaire</h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Our diverse team brings together expertise from dermatology, cosmetic chemistry, sustainability, and design. 
            United by a shared vision of what beauty care should be, we work collaboratively to challenge industry norms 
            and create products that set new standards for quality and sustainability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg mb-2">Our Founder</h3>
              <p className="text-gray-700 mb-4">
                With a background in biochemistry and a passion for holistic health, our founder set out to create skincare 
                products that honor both scientific rigor and natural wisdom. Her vision continues to guide every aspect of Plenaire.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg mb-2">Our Chemists</h3>
              <p className="text-gray-700 mb-4">
                Our team of cosmetic chemists brings decades of experience to the formulation process, ensuring each product 
                delivers maximum efficacy while maintaining the highest standards of safety and quality.
              </p>
            </div>
          </div>
        </section>
        
        {/* Join Us CTA */}
        <section className="bg-rose-100 p-8 rounded-lg text-center">
          <h2 className="font-cormorant text-3xl font-light mb-4">Join Our Journey</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            We believe that beauty care is deeply personal, and we're committed to creating products that empower you 
            to care for your skin in a way that feels authentic and effective. Join us as we continue to evolve and 
            innovate in the spirit of open-air freshness that inspired our name.
          </p>
          <Button 
            size="lg" 
            className="bg-rose-600 hover:bg-rose-700"
            onClick={() => setLocation("/products")}
          >
            Shop Our Products
          </Button>
        </section>
      </div>
    </div>
  );
}