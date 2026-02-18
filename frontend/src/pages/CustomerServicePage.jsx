import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

/**
 * Customer Service Page
 * Hub page linking to FAQ, Support, and Return Policy
 */
export default function CustomerServicePage() {
  const services = [
    {
      title: 'FAQ',
      description: 'Find answers to frequently asked questions about orders, products, and shipping.',
      href: '/faq',
      icon: QuestionMarkCircleIcon,
    },
    {
      title: 'Support',
      description: 'Get help from our support team via chat, email, or phone.',
      href: '/support',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: 'Return Policy',
      description: 'Learn about our return and refund policy for products.',
      href: '/returns',
      icon: ArrowPathIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Customer Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We are here to help. Choose a topic below or reach out to our support team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <Link key={index} to={service.href}>
              <Card hover className="h-full group">
                <div className="flex flex-col items-start gap-4 p-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                    <service.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                    {service.description}
                  </p>
                  <span className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                    Learn more
                    <ChevronRightIcon className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="tel:+966501234567"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
            >
              <PhoneIcon className="w-6 h-6 text-primary-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">+966 50 123 4567</p>
              </div>
            </a>
            <a
              href="mailto:info@chineseautoparts.sa"
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
            >
              <EnvelopeIcon className="w-6 h-6 text-primary-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">info@chineseautoparts.sa</p>
              </div>
            </a>
          </div>
        </Card>

        <div className="text-center">
          <Link to="/">
            <Button variant="primary" size="lg" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
