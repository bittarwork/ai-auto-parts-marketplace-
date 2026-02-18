import PolicyPageLayout from '../components/common/PolicyPageLayout';

/**
 * Privacy Policy Page
 * Data protection and privacy practices
 */
export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout title="Privacy Policy" lastUpdated="February 2026">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Name, email address, phone number, and shipping address</li>
            <li>Account credentials (stored securely)</li>
            <li>Order history and payment information</li>
            <li>Search queries and product preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Improve our search and recommendation systems</li>
            <li>Send order updates and support communications</li>
            <li>Analyze usage to improve our services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Data Storage and Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, or destruction. Payment data is processed by secure payment providers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, remember preferences, and analyze 
            site traffic. You can adjust your browser settings to manage cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Third-Party Sharing</h2>
          <p>
            We may share data with service providers (payment processors, shipping carriers) necessary to fulfill 
            orders. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access and request a copy of your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
