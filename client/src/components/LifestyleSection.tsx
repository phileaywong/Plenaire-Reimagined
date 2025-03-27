import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LifestyleItem } from "@/lib/types";

export default function LifestyleSection() {
  const { data: lifestyleItems = [], isLoading } = useQuery<LifestyleItem[]>({
    queryKey: ["/api/lifestyle"],
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-10 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-6 md:px-10 bg-white">
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-cormorant font-light text-3xl md:text-5xl mb-4">
            Mindful Beauty Rituals
          </h2>
          <p className="font-nunito max-w-2xl mx-auto">
            Our products are designed to enhance your everyday self-care moments
            and turn them into meaningful rituals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lifestyleItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative overflow-hidden rounded-lg group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-8">
                  <h3 className="font-cormorant text-white text-2xl md:text-3xl mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/80 mb-4">{item.description}</p>
                  <a
                    href={item.link || "#"}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(item.link || "/products", "_blank");
                    }}
                    className="text-white font-poppins text-sm uppercase tracking-wider hover:text-roseLight transition-colors duration-300 flex items-center cursor-pointer"
                  >
                    Discover
                    <ArrowRight className="ml-2" size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
