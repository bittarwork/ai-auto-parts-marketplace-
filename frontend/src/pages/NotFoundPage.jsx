import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

/**
 * 404 Not Found Page
 * Shown when the user navigates to an unknown route
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 number */}
        <div className="relative mb-6">
          <span className="text-[10rem] font-extrabold text-gray-100 dark:text-dark-bg-secondary leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Navigation links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<HomeIcon className="w-5 h-5" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" leftIcon={<ShoppingBagIcon className="w-5 h-5" />}>
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { label: 'Categories', href: '/categories' },
              { label: 'Cart', href: '/cart' },
              { label: 'About Us', href: '/about' },
              { label: 'Support', href: '/support' }
            ].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
