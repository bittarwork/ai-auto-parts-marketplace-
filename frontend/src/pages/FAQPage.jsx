import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * FAQ Page
 * Frequently asked questions with accordion
 */
export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How do I search for auto parts?',
      a: 'Use our intelligent search bar on the homepage. You can search by part name, part number, or describe what you need. Our AI will find compatible parts for your vehicle.',
    },
    {
      q: 'How can I check if a part fits my vehicle?',
      a: 'Each product page shows compatibility information. You can filter products by vehicle make, model, and year. Our AI compatibility checker helps verify fitment.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept VISA, Mada, and STCPay. Payment is processed securely at checkout.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Standard shipping takes 3–7 business days. Orders over €500 qualify for free shipping. Express options are available at checkout.',
    },
    {
      q: 'Can I return a product?',
      a: 'Yes. We offer returns within 14 days for unused products in original packaging. See our Return Policy for full details.',
    },
    {
      q: 'Do you offer warranty on parts?',
      a: 'Most parts include manufacturer warranty. Warranty details are shown on each product page.',
    },
    {
      q: 'How do I track my order?',
      a: 'After your order ships, you will receive an email with a tracking number. You can also check order status in your account.',
    },
    {
      q: 'Is there a minimum order amount?',
      a: 'There is no minimum order. Free shipping applies to orders over €500.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container size="md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="overflow-hidden"
              hover={false}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 flex items-start justify-between gap-4"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <ChevronDownIcon
                  className={clsx(
                    'w-5 h-5 flex-shrink-0 text-gray-500 transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-dark-border pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <Link to="/support">
            <Button variant="primary" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              Contact Support
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
