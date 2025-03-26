import { useState } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/newsletter", { email });
      toast({
        title: "Success!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="newsletter-gradient py-16 md:py-24 px-6 md:px-10">
      <div className="container mx-auto">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-cormorant font-light text-3xl md:text-4xl mb-4">
            Join Our Community
          </h2>
          <p className="mb-8">
            Subscribe to receive updates on new products, skincare tips, and
            exclusive offers
          </p>

          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-roseDark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-roseDark text-white font-poppins text-sm uppercase tracking-wider py-3 px-8 rounded-full hover:bg-roseLight transition-colors duration-300 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          <p className="text-sm mt-4 text-gray-600">
            By subscribing, you agree to our Privacy Policy and consent to
            receive updates from our company.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
