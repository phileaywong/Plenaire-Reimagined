import { Separator } from "@/components/ui/separator";

export default function Sustainability() {
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-8">
        Our Commitment to Sustainability
      </h1>
      
      <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
        At Plenaire, sustainability isn't just a buzzword—it's woven into the fabric of everything we do. From our ingredients to our packaging, we're committed to minimizing our environmental impact.
      </p>
      
      {/* Hero Image */}
      <div className="mb-20 rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1592500624072-940cc4e21bb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
          alt="Sustainability at Plenaire"
          className="w-full h-80 object-cover"
        />
      </div>
      
      {/* Our Approach Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-cormorant font-light mb-12 text-center">Our Approach</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                <path d="M8 12h8"/>
                <path d="M12 16V8"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Sustainable Sourcing</h3>
            <p className="text-gray-600">
              We carefully select ingredients that are ethically sourced and environmentally responsible, prioritizing organic and wild-harvested botanicals whenever possible.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.29 7 12 12 20.71 7"/>
                <line x1="12" y1="22" x2="12" y2="12"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Eco-Friendly Packaging</h3>
            <p className="text-gray-600">
              Our packaging is designed with the planet in mind, using recyclable materials, minimal plastic, and FSC-certified paper products from responsibly managed forests.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
                <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/>
                <path d="M19 11h2m-1 -1v2"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Carbon Neutrality</h3>
            <p className="text-gray-600">
              We're committed to reducing our carbon footprint at every stage of our operations, from manufacturing to shipping, and offsetting what we can't eliminate.
            </p>
          </div>
        </div>
      </section>
      
      <Separator className="my-16" />
      
      {/* Sustainable Ingredients */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-cormorant font-light mb-6">Clean, Sustainable Ingredients</h2>
            <p className="text-gray-600 mb-6">
              We believe that what goes on your skin should be as clean and sustainable as what you put in your body. That's why we're committed to using only the highest quality, environmentally responsible ingredients in our formulations.
            </p>
            <p className="text-gray-600 mb-6">
              Our formulations prioritize plant-based ingredients that are:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Organically grown when possible</li>
              <li>Ethically harvested with fair trade practices</li>
              <li>Sourced with respect for local ecosystems</li>
              <li>Free from harmful chemicals and toxins</li>
              <li>Biodegradable and environmentally safe</li>
            </ul>
            <p className="text-gray-600">
              We meticulously research every ingredient we use, ensuring it meets our strict standards for both efficacy and sustainability.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1584355684148-2dd0c6d03ada?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Sustainable Ingredients"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Packaging Innovation */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1611269154421-162e7bd28a1c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Sustainable Packaging"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-cormorant font-light mb-6">Packaging Innovation</h2>
            <p className="text-gray-600 mb-6">
              We're constantly innovating to make our packaging more sustainable without compromising on quality or aesthetics. Our approach includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Using recyclable glass bottles and jars whenever possible</li>
              <li>Minimizing plastic use and incorporating PCR (post-consumer recycled) materials</li>
              <li>Designing refill systems to reduce packaging waste</li>
              <li>Utilizing FSC-certified paper and cardboard for outer packaging</li>
              <li>Using soy-based inks and biodegradable adhesives</li>
              <li>Eliminating unnecessary packaging elements</li>
            </ul>
            <p className="text-gray-600">
              By 2025, we aim to make 100% of our packaging either recyclable, reusable, or compostable.
            </p>
          </div>
        </div>
      </section>
      
      {/* Carbon Footprint */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-cormorant font-light mb-6">Reducing Our Carbon Footprint</h2>
            <p className="text-gray-600 mb-6">
              We're committed to minimizing our environmental impact throughout our supply chain. Our initiatives include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Partnering with local suppliers when possible to reduce transportation emissions</li>
              <li>Using renewable energy in our manufacturing facilities</li>
              <li>Implementing energy-efficient processes and equipment</li>
              <li>Optimizing shipping routes and consolidating orders</li>
              <li>Offsetting carbon emissions through verified environmental projects</li>
            </ul>
            <p className="text-gray-600">
              We measure our carbon footprint annually and are transparent about our progress toward our goal of becoming carbon neutral by 2024.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1565037254267-849e646f4780?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Carbon Footprint Reduction"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
      
      <Separator className="my-16" />
      
      {/* Our Certifications */}
      <section className="mb-20">
        <h2 className="text-3xl font-cormorant font-light mb-12 text-center">Our Certifications</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">Leaping Bunny</h3>
            <p className="text-sm text-gray-600">
              Certified cruelty-free, never tested on animals
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0"/>
                <path d="M12 6a6 6 0 0 0-6 6c0 3.3 2.7 6 6 6 3.3 0 6-2.7 6-6 0-3.3-2.7-6-6-6"/>
                <path d="M8 12h8"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">Ecocert</h3>
            <p className="text-sm text-gray-600">
              Certified organic and natural ingredients
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M19.5 14c-.69 0-1.25.56-1.25 1.25v1.5a1.25 1.25 0 1 0 2.5 0v-1.5c0-.69-.56-1.25-1.25-1.25z"/>
                <path d="M16.25 15.25v1.5c0 .69.56 1.25 1.25 1.25"/>
                <path d="M4.5 14c.69 0 1.25.56 1.25 1.25v1.5a1.25 1.25 0 1 1-2.5 0v-1.5c0-.69.56-1.25 1.25-1.25z"/>
                <path d="M7.75 15.25v1.5c0 .69-.56 1.25-1.25 1.25"/>
                <path d="M14 4.5c0-.69-.56-1.25-1.25-1.25h-1.5a1.25 1.25 0 1 0 0 2.5h1.5c.69 0 1.25-.56 1.25-1.25z"/>
                <path d="M15.25 7.75h-1.5c-.69 0-1.25-.56-1.25-1.25"/>
                <path d="M14 19.5c0 .69-.56 1.25-1.25 1.25h-1.5a1.25 1.25 0 1 1 0-2.5h1.5c.69 0 1.25.56 1.25 1.25z"/>
                <path d="M15.25 16.25h-1.5c-.69 0-1.25.56-1.25 1.25"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">FSC Certified</h3>
            <p className="text-sm text-gray-600">
              Packaging from responsibly managed forests
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
                <path d="m22 12-10.1 5.7-10.1-5.7"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <h3 className="font-medium mb-2">Carbon Neutral</h3>
            <p className="text-sm text-gray-600">
              Working toward complete carbon neutrality
            </p>
          </div>
        </div>
      </section>
      
      {/* Sustainability Goals */}
      <section className="mb-20 bg-gray-50 p-10 rounded-lg">
        <h2 className="text-3xl font-cormorant font-light mb-8 text-center">Our 2025 Sustainability Goals</h2>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 font-medium md:pr-6 mb-2 md:mb-0">
              100% Sustainable Packaging
            </div>
            <div className="md:w-2/3 text-gray-600">
              All packaging will be recyclable, biodegradable, or reusable by 2025, with a focus on eliminating virgin plastic entirely.
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-200 my-6"></div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 font-medium md:pr-6 mb-2 md:mb-0">
              Carbon Negative Operations
            </div>
            <div className="md:w-2/3 text-gray-600">
              Moving beyond carbon neutrality to become carbon negative, removing more carbon from the atmosphere than we emit.
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-200 my-6"></div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 font-medium md:pr-6 mb-2 md:mb-0">
              Zero Waste Manufacturing
            </div>
            <div className="md:w-2/3 text-gray-600">
              Implementing a closed-loop system where all production waste is either recycled, reused, or composted.
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-200 my-6"></div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 font-medium md:pr-6 mb-2 md:mb-0">
              Water Conservation
            </div>
            <div className="md:w-2/3 text-gray-600">
              Reducing water usage in our manufacturing process by 50% and implementing water recycling systems.
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-200 my-6"></div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 font-medium md:pr-6 mb-2 md:mb-0">
              Biodiversity Protection
            </div>
            <div className="md:w-2/3 text-gray-600">
              Supporting reforestation and habitat restoration projects to protect the ecosystems from which we source ingredients.
            </div>
          </div>
        </div>
      </section>
      
      {/* Join Our Mission */}
      <section className="text-center">
        <h2 className="text-3xl font-cormorant font-light mb-6">Join Our Mission</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          Sustainability is a journey, not a destination. We're constantly working to improve our practices and reduce our environmental impact. We invite you to join us in this mission by making mindful choices about the products you use and how you dispose of them.
        </p>
        <button className="bg-primary text-white py-3 px-8 rounded-md hover:bg-primary/90 transition-colors">
          Learn More About Our Initiatives
        </button>
      </section>
    </div>
  );
}