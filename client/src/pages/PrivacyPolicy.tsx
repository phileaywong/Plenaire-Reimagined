import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-32">
      <h1 className="font-cormorant text-4xl md:text-5xl font-light text-center mb-16">
        Privacy Policy
      </h1>
      
      <div className="max-w-3xl mx-auto prose prose-gray">
        <p className="text-gray-600 mb-6">
          Last Updated: March 27, 2025
        </p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Introduction</h2>
          <p>
            At Plenaire, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Personal Data</h3>
          <p>
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Register on our website</li>
            <li>Place an order</li>
            <li>Subscribe to our newsletter</li>
            <li>Participate in promotions or surveys</li>
            <li>Contact our customer service</li>
          </ul>
          <p>
            This information may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Shipping and billing address</li>
            <li>Phone number</li>
            <li>Payment information (we do not store complete credit card information)</li>
            <li>Purchase history</li>
            <li>Communication preferences</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-6 mb-3">Automatically Collected Information</h3>
          <p>
            When you visit our website, we may automatically collect certain information about your device, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages viewed</li>
            <li>Time and date of your visit</li>
            <li>Time spent on pages</li>
          </ul>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">How We Use Your Information</h2>
          <p>
            We may use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processing and fulfilling your orders</li>
            <li>Creating and managing your account</li>
            <li>Providing customer support</li>
            <li>Sending transactional emails (order confirmations, shipping updates)</li>
            <li>Sending marketing communications (if you've opted in)</li>
            <li>Improving our website and product offerings</li>
            <li>Analyzing usage patterns and trends</li>
            <li>Preventing fraudulent transactions and monitoring against theft</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect information about your browsing activities. Cookies are small text files stored on your device that help us provide you with a better browsing experience.
          </p>
          <p className="mt-4">
            Types of cookies we use:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
            <li><strong>Analytical cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong>Marketing cookies:</strong> Allow us to deliver personalized advertisements</li>
          </ul>
          <p className="mt-4">
            You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use all features of our website.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Sharing Your Information</h2>
          <p>
            We may share your information with third parties in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service providers:</strong> Companies that help us operate our business (payment processors, shipping carriers, etc.)</li>
            <li><strong>Business partners:</strong> Trusted partners who help us provide our services or market products</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of sensitive information</li>
            <li>Secure access to our systems</li>
            <li>Regular security assessments</li>
            <li>Employee training on data protection</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction or objection to processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Children's Privacy</h2>
          <p>
            Our website is not intended for children under 16 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-cormorant font-medium mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
        </section>
        
        <Separator className="my-8" />
        
        <section>
          <h2 className="text-2xl font-cormorant font-medium mb-4">Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <address className="not-italic mt-4">
            <strong>Plenaire, Inc.</strong><br />
            123 Beauty Lane<br />
            New York, NY 10001<br /><br />
            Email: privacy@plenaire.com<br />
            Phone: (555) 123-4567
          </address>
        </section>
      </div>
    </div>
  );
}