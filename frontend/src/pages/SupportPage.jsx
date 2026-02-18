import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Support Page
 * Customer support contact options and help resources
 */
export default function SupportPage() {
  const supportOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our AI assistant. Available 24/7.',
      action: 'Use the chat widget in the bottom-right corner.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: 'Email Support',
      description: 'Send us an email and we will respond within 24 hours.',
      action: 'info@chineseautoparts.sa',
      href: 'mailto:info@chineseautoparts.sa',
      icon: EnvelopeIcon,
    },
    {
      title: 'Phone Support',
      description: 'Speak with our support team during business hours.',
      action: '+966 50 123 4567',
      href: 'tel:+966501234567',
      icon: PhoneIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We are here to help. Choose the best way to reach us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {supportOptions.map((option, index) => (
            <Card key={index} className="h-full">
              <div className="p-6 flex flex-col">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg w-fit mb-4">
                  <option.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  {option.description}
                </p>
                {option.href ? (
                  <a
                    href={option.href}
                    className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    {option.action}
                  </a>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {option.action}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mb-10">
          <div className="flex items-start gap-4 p-6">
            <ClockIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Support Hours
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>AI Chat:</strong> 24/7<br />
                <strong>Email:</strong> Response within 24 hours<br />
                <strong>Phone:</strong> Sun–Thu 9:00 AM – 6:00 PM (local time)
              </p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/faq">
            <Button variant="outline" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              View FAQ
            </Button>
          </Link>
          <Link to="/">
            <Button variant="primary" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
