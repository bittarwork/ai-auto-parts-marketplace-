import PolicyPageLayout from '../components/common/PolicyPageLayout';

/**
 * Return Policy Page
 * Return and refund policy content
 */
export default function ReturnPolicyPage() {
  return (
    <PolicyPageLayout title="Return Policy" lastUpdated="February 2026">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Overview</h2>
          <p>
            We want you to be satisfied with your purchase. If you are not completely happy with your order, 
            you may return eligible items within 14 days of delivery for a refund or exchange.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Eligibility</h2>
          <p>To be eligible for a return, items must:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Be returned within 14 days of delivery</li>
            <li>Be unused and in original packaging</li>
            <li>Include all accessories and documentation</li>
            <li>Not be installed or used on a vehicle</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Non-Returnable Items</h2>
          <p>The following items cannot be returned:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Custom or special-order parts</li>
            <li>Items that have been installed or used</li>
            <li>Electrical components that have been connected</li>
            <li>Items without original packaging</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">How to Return</h2>
          <ol className="list-decimal pl-6 mt-2 space-y-2">
            <li>Contact our support team to initiate a return request</li>
            <li>Receive a Return Authorization (RA) number</li>
            <li>Pack the item securely in its original packaging</li>
            <li>Ship the item to the address provided with the RA number</li>
            <li>Keep your tracking number for reference</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Refunds</h2>
          <p>
            Refunds will be processed within 5–7 business days after we receive and inspect the returned item. 
            The refund will be issued to the original payment method. Shipping costs are non-refundable unless 
            the return is due to our error or a defective product.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Exchanges</h2>
          <p>
            For exchanges, please contact support with the correct product details. We will process the exchange 
            once the original item is received and verified.
          </p>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
