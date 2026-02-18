import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

/**
 * Legal Page
 * Hub page linking to Terms, Privacy Policy, and Shipping Policy
 */
export default function LegalPage() {
  const legalPages = [
    {
      title: 'Terms and Conditions',
      description: 'Read our terms of service and usage guidelines.',
      href: '/terms',
      icon: DocumentTextIcon,
    },
    {
      title: 'Privacy Policy',
      description: 'Learn how we collect, use, and protect your data.',
      href: '/privacy',
      icon: ShieldCheckIcon,
    },
    {
      title: 'Shipping Policy',
      description: 'Shipping options, delivery times, and costs.',
      href: '/shipping',
      icon: TruckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Legal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Important legal information and policies for using our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {legalPages.map((item, index) => (
            <Link key={index} to={item.href}>
              <Card hover className="h-full group">
                <div className="flex flex-col items-start gap-4 p-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                    <item.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
                    {item.description}
                  </p>
                  <span className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
                    Read more
                    <ChevronRightIcon className="w-4 h-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

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
