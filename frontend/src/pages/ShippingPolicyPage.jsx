import PolicyPageLayout from '../components/common/PolicyPageLayout';

/**
 * Shipping Policy Page
 * Shipping options, delivery times, and costs
 */
export default function ShippingPolicyPage() {
  return (
    <PolicyPageLayout title="Shipping Policy" lastUpdated="February 2026">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Shipping Options</h2>
          <p>We offer the following shipping methods:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Standard Shipping:</strong> 3–7 business days</li>
            <li><strong>Express Shipping:</strong> 1–3 business days (additional cost)</li>
            <li><strong>Free Shipping:</strong> For orders over €500</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Shipping Costs</h2>
          <p>Shipping costs are calculated at checkout based on:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Order value (free shipping for orders over €500)</li>
            <li>Delivery address</li>
            <li>Selected shipping method</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Processing Time</h2>
          <p>
            Orders are typically processed within 1–2 business days. You will receive a confirmation email once 
            your order ships with tracking information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Delivery Areas</h2>
          <p>
            We ship to addresses within our service area. Delivery times may vary by region. International 
            shipping may be available—contact support for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Order Tracking</h2>
          <p>
            After your order ships, you will receive an email with a tracking number. Use this to monitor 
            your shipment status. You can also check order status in your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Damaged or Lost Shipments</h2>
          <p>
            If your order arrives damaged or is lost in transit, please contact our support team within 48 hours 
            of delivery. We will work with the carrier to resolve the issue and arrange a replacement or refund.
          </p>
        </section>
      </div>
    </PolicyPageLayout>
  );
}
