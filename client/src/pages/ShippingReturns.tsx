import { Separator } from "@/components/ui/separator";

export default function ShippingReturns() {
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-16">
        Shipping & Returns
      </h1>
      
      <div className="max-w-3xl mx-auto">
        {/* Shipping Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-cormorant font-medium mb-6">Shipping Information</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Domestic Shipping</h3>
              <p className="text-gray-600 mb-4">
                We offer the following shipping options for all US orders:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Standard Shipping (3-5 business days): $5.95 or FREE on orders over $50</li>
                <li>Express Shipping (1-2 business days): $12.95</li>
                <li>Overnight Shipping (next business day): $24.95</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">International Shipping</h3>
              <p className="text-gray-600 mb-4">
                We ship to most countries worldwide. International shipping rates are calculated at checkout based on destination and weight.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Canada and Mexico: Starting at $15.95 (5-10 business days)</li>
                <li>Europe: Starting at $19.95 (7-14 business days)</li>
                <li>Asia Pacific: Starting at $24.95 (10-21 business days)</li>
                <li>Rest of World: Starting at $29.95 (14-30 business days)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Please note that international customers are responsible for any customs fees, taxes, or duties that may be imposed by their country's regulations.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Order Processing</h3>
              <p className="text-gray-600">
                Orders are typically processed within 1-2 business days. Orders placed after 12 PM EST may be processed the following business day. During high-volume periods (holidays, promotions), processing may take an additional 1-2 business days.
              </p>
            </div>
          </div>
        </section>
        
        <Separator className="my-12" />
        
        {/* Returns Section */}
        <section>
          <h2 className="text-2xl font-cormorant font-medium mb-6">Return Policy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-600">
                We stand behind the quality of our products. If you're not completely satisfied with your purchase, we offer a simple return process within 30 days of delivery.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Return Eligibility</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Items must be returned within 30 days of receipt</li>
                <li>Products must be unused, unopened, and in their original packaging</li>
                <li>Gift sets must be returned complete</li>
                <li>Sale items are final sale and cannot be returned unless defective</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Return Process</h3>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>Log into your account and click on "Order History"</li>
                <li>Find the order containing the item(s) you wish to return</li>
                <li>Select "Start Return" and follow the prompts to generate a return label</li>
                <li>Package the item(s) securely in the original packaging if possible</li>
                <li>Attach the return label and drop off at your nearest shipping location</li>
                <li>Once received and inspected, your refund will be processed within 5-7 business days</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Return Shipping</h3>
              <p className="text-gray-600">
                Customers are responsible for return shipping costs unless the product is defective or was sent in error. Return shipping fees will be deducted from your refund amount.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Exchanges</h3>
              <p className="text-gray-600">
                We do not process direct exchanges. If you wish to exchange an item, please return it for a refund and place a new order for the preferred item.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Damaged or Defective Items</h3>
              <p className="text-gray-600">
                If you receive a damaged or defective product, please contact our customer service team at support@plenaire.com within 7 days of receipt. Include your order number and clear photos of the damaged item and packaging.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}