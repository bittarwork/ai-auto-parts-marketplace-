import ProductCard from './ProductCard';
import clsx from 'clsx';
import { SparklesIcon, MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Product Grid Component
 * Responsive grid layout for product cards with smart empty state
 */
export default function ProductGrid({ 
  products = [],
  columns = 4,
  showCompatibility = false,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  className = '',
  // nlpAnalysis: structured data from AI about what the user searched for
  nlpAnalysis = null
}) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  };

  // Build a human-readable description of what AI understood from the query
  const buildIdentifiedProduct = () => {
    if (!nlpAnalysis) return null;
    const parts = [];
    if (nlpAnalysis.partType) parts.push(nlpAnalysis.partType);
    if (nlpAnalysis.brand)    parts.push(`for ${nlpAnalysis.brand}`);
    if (nlpAnalysis.model)    parts.push(nlpAnalysis.model);
    if (nlpAnalysis.year)     parts.push(`(${nlpAnalysis.year})`);
    return parts.length > 0 ? parts.join(' ') : null;
  };
  
  if (products.length === 0) {
    const identifiedProduct = buildIdentifiedProduct();
    const hasAiContext = identifiedProduct !== null && nlpAnalysis?.confidence > 30;

    return (
      <div className="py-12">
        {/* AI-powered not-found card */}
        {hasAiContext ? (
          <div className="max-w-lg mx-auto">
            {/* AI understood badge */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-primary-500" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                AI Search Analysis
              </span>
            </div>

            {/* Identified product box */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-5 mb-5 text-center">
              <ExclamationCircleIcon className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Product Not Found in Our Catalog
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We understood you are looking for:
              </p>

              {/* Extracted entities chips */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {nlpAnalysis.partType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/40">
                    Part: {nlpAnalysis.partType}
                  </span>
                )}
                {nlpAnalysis.brand && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40">
                    Brand: {nlpAnalysis.brand}
                  </span>
                )}
                {nlpAnalysis.model && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/40">
                    Model: {nlpAnalysis.model}
                  </span>
                )}
                {nlpAnalysis.year && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40">
                    Year: {nlpAnalysis.year}
                  </span>
                )}
              </div>

              {/* Identified product summary */}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                <strong className="text-gray-700 dark:text-gray-300">{identifiedProduct}</strong>
                {' '}is currently not available in our store.
              </p>
            </div>

            {/* Suggestions */}
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What you can do:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Try searching with different keywords</li>
                <li>• Remove the model or year to broaden results</li>
                <li>• Check back later — we add new parts regularly</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Generic empty state (no AI context or low confidence) */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-bg-secondary rounded-full mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
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
