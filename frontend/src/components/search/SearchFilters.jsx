import { useState } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import clsx from 'clsx';

const BRANDS = ['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD'];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'engine', label: 'Engine' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'body', label: 'Body Parts' },
  { value: 'filters', label: 'Filters' },
  { value: 'cooling', label: 'Cooling' },
  { value: 'transmission', label: 'Transmission' }
];

/**
 * SearchFilters Panel
 * Collapsible filter panel for refining AI search results.
 * Filters: brand, price range, in stock, min rating, category.
 */
export default function SearchFilters({ filters = {}, onChange, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    brands: filters.brands || [],
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    inStock: filters.inStock || false,
    minRating: filters.minRating || 0,
    category: filters.category || ''
  });

  const updateFilter = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    emitChange(updated);
  };

  const toggleBrand = (brand) => {
    const brands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter(b => b !== brand)
      : [...localFilters.brands, brand];
    updateFilter('brands', brands);
  };

  const emitChange = (f) => {
    const cleaned = {};
    if (f.brands?.length > 0) cleaned.brands = f.brands;
    if (f.minPrice) cleaned.minPrice = Number(f.minPrice);
    if (f.maxPrice) cleaned.maxPrice = Number(f.maxPrice);
    if (f.inStock) cleaned.inStock = true;
    if (f.minRating > 0) cleaned.minRating = f.minRating;
    if (f.category) cleaned.category = f.category;
    onChange(cleaned);
  };

  const clearAll = () => {
    const empty = { brands: [], minPrice: '', maxPrice: '', inStock: false, minRating: 0, category: '' };
    setLocalFilters(empty);
    onChange({});
  };

  const activeCount = [
    localFilters.brands.length > 0,
    localFilters.minPrice || localFilters.maxPrice,
    localFilters.inStock,
    localFilters.minRating > 0,
    localFilters.category
  ].filter(Boolean).length;

  return (
    <div className={clsx('bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl', className)}>
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-gray-100 dark:border-dark-border pt-4">
          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Brand Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Brand
            </label>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                    localFilters.brands.includes(brand)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-300 border-gray-300 dark:border-dark-border hover:border-primary-400'
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Price Range (€)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                min="0"
              />
              <span className="text-gray-400 text-sm">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              In Stock Only
            </label>
            <button
              onClick={() => updateFilter('inStock', !localFilters.inStock)}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                localFilters.inStock ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={clsx(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  localFilters.inStock ? 'translate-x-5.5 left-0.5' : 'left-0.5'
                )}
                style={{ transform: localFilters.inStock ? 'translateX(22px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {/* Min Rating */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
              Minimum Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => updateFilter('minRating', localFilters.minRating === star ? 0 : star)}
                  className="p-0.5"
                >
                  <StarIcon
                    className={clsx(
                      'w-6 h-6 transition-colors',
                      star <= localFilters.minRating
                        ? 'text-warning-500 fill-warning-500'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                </button>
              ))}
              {localFilters.minRating > 0 && (
                <span className="text-xs text-gray-500 ml-1">& up</span>
              )}
            </div>
          </div>

          {/* Clear All */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
