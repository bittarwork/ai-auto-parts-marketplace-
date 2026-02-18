import { Link } from 'react-router-dom';
import Container from './Container';
import Button from './Button';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * PolicyPageLayout - Reusable layout for policy/legal pages
 * Provides consistent header, content area, and back button
 */
export default function PolicyPageLayout({ title, children, lastUpdated }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container size="sm">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        <div className="mb-10 space-y-6">
          {children}
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline" size="lg" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
