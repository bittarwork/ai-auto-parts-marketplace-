import PolicyPageLayout from '../components/common/PolicyPageLayout';

/**
 * Terms and Conditions Page
 * Legal terms of service
 */
export default function TermsPage() {
  return (
    <PolicyPageLayout title="Terms and Conditions" lastUpdated="February 2026">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Chinese Auto Parts platform, you agree to be bound by these Terms and Conditions. 
            If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Use of Service</h2>
          <p>You agree to use this platform only for lawful purposes. You may not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Transmit any harmful code or attempt to gain unauthorized access</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Use automated systems to access the service without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activities that occur under your account. Notify us immediately of any unauthorized use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Products and Orders</h2>
          <p>
            We strive to display product information accurately. However, we do not warrant that descriptions, 
            pricing, or availability are error-free. We reserve the right to correct errors and cancel orders 
            when necessary.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Chinese Auto Parts shall not be liable for any indirect, 
            incidental, special, or consequential damages arising from your use of the service or purchase of products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the service after changes constitutes 
            acceptance of the updated terms.
          </p>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
