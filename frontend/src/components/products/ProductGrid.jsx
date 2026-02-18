import ProductCard from './ProductCard';
import clsx from 'clsx';

/**
 * Product Grid Component
 * Responsive grid layout for product cards
 */
export default function ProductGrid({ 
  products = [],
  columns = 4,
  showCompatibility = false,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  className = ''
}) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-bg-secondary rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }
  
  return (
    <div className={clsx(
      'grid gap-6',
      columnClasses[columns] || columnClasses[4],
      className
    )}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          showCompatibility={showCompatibility}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={wishlistIds.includes(product._id)}
        />
      ))}
    </div>
  );
}
