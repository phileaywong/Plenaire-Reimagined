import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Hero() {
  const [, setLocation] = useLocation();
  
  const handleDiscoverProducts = () => {
    setLocation("/products");
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-10">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            className="font-cormorant font-light text-4xl md:text-6xl mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Luxury Skincare for Modern Life
          </motion.h1>
          <motion.p
            className="font-nunito text-lg md:text-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Mindful beauty products designed for your everyday rituals
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-x-4"
          >
            <button
              onClick={scrollToProducts}
              className="inline-block bg-roseDark text-white font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-roseLight transition-colors duration-300"
            >
              Discover Our Products
            </button>
            <button
              onClick={handleDiscoverProducts}
              className="inline-block border border-darkText text-darkText font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-darkText hover:text-white transition-colors duration-300"
            >
              View All Products
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
