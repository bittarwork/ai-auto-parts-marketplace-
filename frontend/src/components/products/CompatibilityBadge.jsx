import { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import aiSearchService from '../../services/aiSearchService';
import vehicleService from '../../services/vehicleService';
import clsx from 'clsx';

/**
 * CompatibilityBadge Component
 * Shows whether a product is compatible with the user's vehicle.
 * Green = compatible, Red = not compatible, Gray = no vehicle / unknown.
 */
export default function CompatibilityBadge({
  productId,
  preloadedStatus = null,
  variant = 'badge', // 'badge' | 'detailed'
  className = ''
}) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [compatibility, setCompatibility] = useState(preloadedStatus);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn && !vehiclesLoaded) {
      loadVehicles();
    }
  }, [isLoggedIn]);

  // Auto-check when a vehicle is selected
  useEffect(() => {
    if (selectedVehicleId && productId) {
      checkCompatibility(selectedVehicleId);
    }
  }, [selectedVehicleId, productId]);

  const loadVehicles = async () => {
    try {
      const res = await vehicleService.getVehicles();
      if (res.success && res.data?.length > 0) {
        setVehicles(res.data);
        const primary = res.data.find(v => v.isPrimary) || res.data[0];
        setSelectedVehicleId(primary._id);
      }
      setVehiclesLoaded(true);
    } catch {
      setVehiclesLoaded(true);
    }
  };

  const checkCompatibility = async (vehicleId) => {
    setLoading(true);
    try {
      const res = await aiSearchService.checkCompatibility(productId, vehicleId);
      if (res.success) {
        setCompatibility(res.data);
      }
    } catch (err) {
      console.error('Compatibility check failed:', err);
      setCompatibility(null);
    } finally {
      setLoading(false);
    }
  };

  // Badge-only variant (used inside ProductCard)
  if (variant === 'badge') {
    if (!isLoggedIn || vehicles.length === 0) {
      return null;
    }

    if (loading) {
      return (
        <span className={clsx('inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary text-gray-500 dark:text-gray-400 animate-pulse', className)}>
          Checking...
        </span>
      );
    }

    if (!compatibility) return null;

    const isCompatible = compatibility.isCompatible;

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
          isCompatible
            ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400'
            : 'bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400',
          className
        )}
      >
        {isCompatible ? (
          <>
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Compatible
          </>
        ) : (
          <>
            <XCircleIcon className="w-3.5 h-3.5" />
            Not Compatible
          </>
        )}
      </span>
    );
  }

  // Detailed variant (used on ProductDetailsPage)
  return (
    <div className={clsx('rounded-xl border p-4', className, {
      'border-success-200 dark:border-success-800/30 bg-success-50 dark:bg-success-900/10': compatibility?.isCompatible,
      'border-error-200 dark:border-error-800/30 bg-error-50 dark:bg-error-900/10': compatibility && !compatibility.isCompatible,
      'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary': !compatibility
    })}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        {compatibility?.isCompatible ? (
          <CheckCircleIcon className="w-5 h-5 text-success-500" />
        ) : compatibility && !compatibility.isCompatible ? (
          <XCircleIcon className="w-5 h-5 text-error-500" />
        ) : (
          <QuestionMarkCircleIcon className="w-5 h-5 text-gray-400" />
        )}
        Vehicle Compatibility Check
      </h4>

      {!isLoggedIn ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Log in
          </a>{' '}
          and add a vehicle to check compatibility.
        </p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <a href="/vehicles" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Add a vehicle
          </a>{' '}
          to check if this part fits your car.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Vehicle Selector */}
          <div className="relative">
            <select
              value={selectedVehicleId || ''}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full appearance-none border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 pr-8 bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.brand} {v.model} ({v.year}){v.isPrimary ? ' ★' : ''}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Result */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
              Checking compatibility...
            </div>
          ) : compatibility ? (
            <div className="flex items-center gap-2">
              {compatibility.isCompatible ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="text-sm font-medium text-success-700 dark:text-success-400">
                    This part is compatible with your vehicle
                  </span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-error-500" />
                  <span className="text-sm font-medium text-error-700 dark:text-error-400">
                    This part may not be compatible with your vehicle
                  </span>
                </>
              )}
            </div>
          ) : null}

          {compatibility?.details && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {compatibility.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
