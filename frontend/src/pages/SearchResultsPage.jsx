import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '../components/common/Container';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Badge from '../components/common/Badge';
import IntelligentSearchBar from '../components/search/IntelligentSearchBar';
import SearchFilters from '../components/search/SearchFilters';
import ProductGrid from '../components/products/ProductGrid';
import { InlineLoader } from '../components/common/Spinner';
import aiSearchService from '../services/aiSearchService';
import { useWishlist } from '../contexts/WishlistContext';
import {
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * ★★★ SEARCH RESULTS PAGE ★★★
 * AI-powered search results with NLP analysis, filters, and related searches
 */
export default function SearchResultsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleWishlist, wishlistIds } = useWishlist();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({});
  const [relatedSearches, setRelatedSearches] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  
  useEffect(() => {
    if (query) {
      performSearch();
      loadRelatedSearches();
    }
  }, [query, currentPage, sortBy, filters]);
  
  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiSearchService.intelligentSearch(query, {
        language: 'en',
        page: currentPage,
        limit: 20,
        sortBy,
        filters
      });
      
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedSearches = async () => {
    setRelatedLoading(true);
    try {
      const res = await aiSearchService.getRelatedSearches(query, 'en');
      if (res.success && res.data) {
        setRelatedSearches(res.data);
      }
    } catch {
      setRelatedSearches([]);
    } finally {
      setRelatedLoading(false);
    }
  };
  
  const handleNewSearch = (newQuery) => {
    setSearchParams({ q: newQuery });
    setCurrentPage(1);
    setFilters({});
  };
  
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container>
        {/* Search Bar */}
        <div className="mb-6">
          <IntelligentSearchBar
            onSearch={handleNewSearch}
            autoFocus
          />
        </div>

        {/* Filters Panel */}
        <div className="mb-6">
          <SearchFilters filters={filters} onChange={handleFiltersChange} />
        </div>
        
        {/* Loading State */}
        {loading && <InlineLoader text="Searching with AI..." />}
        
        {/* Error State */}
        {error && (
          <Card className="bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800/30">
            <p className="text-error-800 dark:text-error-400">{error}</p>
          </Card>
        )}
        
        {/* Results */}
        {!loading && results && (
          <>
            {/* NLP Analysis Card */}
            {results.nlpAnalysis && results.nlpAnalysis.confidence > 30 && (
              <Card className="mb-6 border-primary-200 dark:border-primary-800/30">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      AI Understanding of Your Search
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.nlpAnalysis.partType && (
                        <Badge variant="primary">
                          Part: {results.nlpAnalysis.partType}
                        </Badge>
                      )}
                      {results.nlpAnalysis.brand && (
                        <Badge variant="primary">
                          Brand: {results.nlpAnalysis.brand}
                        </Badge>
                      )}
                      {results.nlpAnalysis.model && (
                        <Badge variant="primary">
                          Model: {results.nlpAnalysis.model}
                        </Badge>
                      )}
                      {results.nlpAnalysis.year && (
                        <Badge variant="primary">
                          Year: {results.nlpAnalysis.year}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        Confidence: {results.nlpAnalysis.confidence}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Related Searches */}
            {relatedSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Related Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedSearches.map((rs, index) => (
                    <Link
                      key={index}
                      to={`/search?q=${encodeURIComponent(typeof rs === 'string' ? rs : rs.query || rs)}`}
                      className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-dark-bg-secondary text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <MagnifyingGlassIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {typeof rs === 'string' ? rs : rs.query || rs}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Search Results
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Found {results.pagination?.total || 0} products{results.searchMetadata?.searchTime ? ` in ${results.searchMetadata.searchTime}ms` : ''}
                </p>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input py-2"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            
            {/* Products Grid */}
            <ProductGrid
              products={results.products}
              showCompatibility={results.searchMetadata?.hasVehicles}
              onToggleWishlist={toggleWishlist}
              wishlistIds={wishlistIds}
            />
            
            {/* Pagination */}
            {results.pagination?.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!results.pagination.hasPrev}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {[...Array(results.pagination.pages)].map((_, i) => {
                    const pageNum = i + 1;
                    const showPage = pageNum === 1 || 
                                    pageNum === results.pagination.pages || 
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                    
                    if (!showPage && pageNum === 2) {
                      return <span key={i} className="px-2 text-gray-500">...</span>;
                    }
                    if (!showPage && pageNum === results.pagination.pages - 1) {
                      return <span key={i} className="px-2 text-gray-500">...</span>;
                    }
                    if (!showPage) return null;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                          pageNum === currentPage
                            ? "bg-primary-600 text-white"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!results.pagination.hasNext}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg-secondary border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
        
        {/* No Query State */}
        {!query && !loading && (
          <div className="text-center py-20">
            <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start Your Intelligent Search
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Search naturally, like "oil filter for Chery Tiggo 2020"
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
