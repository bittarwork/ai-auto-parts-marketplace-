import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProductGrid from '../components/products/ProductGrid';
import { InlineLoader } from '../components/common/Spinner';
import productService from '../services/productService';
import { useWishlist } from '../contexts/WishlistContext';
import categoryService from '../services/categoryService';
import { flattenCategories } from '../utils/categoryUtils';
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * All Products Page
 * Browse all products with advanced filtering and sorting
 */
export default function AllProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, wishlistIds } = useWishlist();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') || '',
    featured: searchParams.get('featured') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1
  });
  
  // Chinese car brands
  const brands = ['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD'];
  
  // Sort options
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name.en-asc', label: 'Name: A-Z' },
    { value: 'name.en-desc', label: 'Name: Z-A' }
  ];
  
  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);
  
  const loadCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });
      
      const response = await productService.getAllProducts(params);
      
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) {
        params.set(k, newFilters[k]);
      }
    });
    setSearchParams(params);
  };
  
  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1
    }));
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    params.delete('page');
    setSearchParams(params);
  };
  
  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };
  
  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key] && !['sortBy', 'sortOrder', 'page'].includes(key)
  ).length;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our complete catalog of Chinese auto parts
          </p>
        </div>
        
        {/* Search & Filter Bar */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            
            {/* Sort */}
            <div className="w-full md:w-64">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input py-3"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </Card>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  leftIcon={<XMarkIcon className="w-4 h-4" />}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input py-2"
                >
                  <option value="">All Categories</option>
                  {flattenCategories(categories).map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {'—'.repeat(cat.depth || 0)} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Brand Filter */}
              <div>
                <label className="label">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="input py-2"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Min Price */}
              <div>
                <label className="label">Min Price (SAR)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>
              
              {/* Max Price */}
              <div>
                <label className="label">Max Price (SAR)</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
              
              {/* In Stock Only */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock === 'true'}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  In Stock Only
                </label>
              </div>
              
              {/* Featured Only */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.featured === 'true'}
                  onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured Only
                </label>
              </div>
            </div>
          </Card>
        )}
        
        {/* Results Count */}
        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <InlineLoader text="Loading products..." />
        )}
        
        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <ProductGrid
            products={products}
            columns={4}
            onToggleWishlist={toggleWishlist}
            wishlistIds={wishlistIds}
          />
        )}
        
        {/* No Results */}
        {!loading && products.length === 0 && (
          <Card className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-bg-secondary rounded-full mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        )}
        
        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              
              {[...Array(pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                const showPage = pageNum === 1 || 
                                pageNum === pagination.pages || 
                                (pageNum >= filters.page - 1 && pageNum <= filters.page + 1);
                
                if (!showPage && pageNum === 2) {
                  return <span key={i} className="px-2 text-gray-500">...</span>;
                }
                if (!showPage && pageNum === pagination.pages - 1) {
                  return <span key={i} className="px-2 text-gray-500">...</span>;
                }
                if (!showPage) return null;
                
                return (
                  <Button
                    key={i}
                    variant={pageNum === filters.page ? 'primary' : 'outline'}
                    onClick={() => handleFilterChange('page', pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </Container>
    </div>
  );
}
