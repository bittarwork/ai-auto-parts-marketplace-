import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ProductGrid from './ProductGrid';
import Button from '../common/Button';
import aiSearchService from '../../services/aiSearchService';
import vehicleService from '../../services/vehicleService';

/**
 * RecommendedProducts Widget
 * Fetches personalized recommendations for logged-in users with vehicles.
 * Falls back to popular products when not logged in or no vehicles registered.
 */
export default function RecommendedProducts({
  limit = 4,
  title,
  showViewAll = true,
  onToggleWishlist,
  wishlistIds
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleName, setVehicleName] = useState('');
  const [isPersonalized, setIsPersonalized] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        // Try to get primary vehicle for personalized recs
        const vehiclesRes = await vehicleService.getVehicles();
        const vehicles = vehiclesRes.success ? vehiclesRes.data || [] : [];
        const primary = vehicles.find(v => v.isPrimary) || vehicles[0];

        if (primary) {
          setVehicleName(`${primary.brand} ${primary.model}`);
          const recRes = await aiSearchService.getRecommendations({
            vehicleId: primary._id,
            limit
          });
          if (recRes.success && recRes.data?.length > 0) {
            setProducts(recRes.data);
            setIsPersonalized(true);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback: popular products
      const popRes = await aiSearchService.getPopularProducts(limit);
      if (popRes.success) {
        setProducts(popRes.data || []);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      try {
        const popRes = await aiSearchService.getPopularProducts(limit);
        if (popRes.success) setProducts(popRes.data || []);
      } catch {
        // silent fail
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-dark-bg-tertiary rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-dark-bg-tertiary rounded-xl h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const displayTitle = title || (
    isPersonalized
      ? `Recommended for Your ${vehicleName}`
      : 'Recommended Products'
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayTitle}
          </h2>
          {isPersonalized && (
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
              AI Personalized
            </span>
          )}
        </div>
        {showViewAll && (
          <Link to="/products">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        )}
      </div>
      <ProductGrid
        products={products}
        columns={4}
        onToggleWishlist={onToggleWishlist}
        wishlistIds={wishlistIds}
      />
    </div>
  );
}
