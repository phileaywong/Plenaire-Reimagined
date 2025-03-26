import Hero from "@/components/Hero";
import FeaturedProduct from "@/components/FeaturedProduct";
import ProductGrid from "@/components/ProductGrid";
import LifestyleSection from "@/components/LifestyleSection";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedProduct />
      <ProductGrid />
      <LifestyleSection />
      <Newsletter />
    </div>
  );
}
