import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQs() {
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-16">
        Frequently Asked Questions
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium">How do I choose the right products for my skin type?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              We recommend starting with our carefully formulated basics for all skin types. If you have specific concerns, look for products with key ingredients targeting those issues. Our cleansers and moisturizers are designed to work with all skin types, while our specialized treatments can be added based on your specific needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium">Are your products suitable for sensitive skin?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Yes, all our products are formulated with sensitive skin in mind. We avoid harsh chemicals, synthetic fragrances, and common irritants. However, we always recommend doing a patch test before using a new product if you have particularly sensitive skin.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium">How long does shipping take?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout for delivery within 1-2 business days. International shipping times vary by location, usually between 7-14 business days.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium">What is your return policy?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              We offer a 30-day return policy for all unused items in their original packaging. If you're not completely satisfied with your purchase, you can return it for a full refund. Please note that return shipping costs are the responsibility of the customer unless the product was damaged or defective.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-medium">Are your products cruelty-free and vegan?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Yes, all our products are 100% cruelty-free, and we never test on animals. Most of our products are vegan, although a few contain ingredients like honey or beeswax. These are clearly labeled on our product pages and packaging.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg font-medium">How can I track my order?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Once your order ships, you'll receive a confirmation email with tracking information. You can also log into your account and view your order status under "Order History" in the account dashboard.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger className="text-lg font-medium">What ingredients do you avoid in your formulations?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              We formulate without parabens, sulfates, phthalates, mineral oils, synthetic fragrances, synthetic colors, and other potentially harmful ingredients. We prioritize natural, plant-based ingredients that are effective and gentle on the skin.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-8">
            <AccordionTrigger className="text-lg font-medium">Do you offer samples before purchasing full-size products?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Yes, we offer sample sizes of most products. Look for the "Try It" option on product pages, or check out our travel kit which includes mini versions of our bestsellers. Orders over $75 also qualify for free samples at checkout.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-9">
            <AccordionTrigger className="text-lg font-medium">How should I store my products?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              For optimal effectiveness, store your products in a cool, dry place away from direct sunlight. Some products, particularly those with vitamin C or probiotics, might benefit from refrigeration – check individual product instructions for specific guidance.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-10">
            <AccordionTrigger className="text-lg font-medium">Do you ship internationally?</AccordionTrigger>
            <AccordionContent className="text-gray-600">
              Yes, we ship to most countries worldwide. International customers may be responsible for customs fees and import duties depending on local regulations. Shipping rates and delivery times are calculated at checkout based on your location.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}