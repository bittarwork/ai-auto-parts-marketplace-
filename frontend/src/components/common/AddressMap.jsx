import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker in React-Leaflet (webpack/vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Center map on marker when coordinates load
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 15);
    }
  }, [map, center]);
  return null;
}

/**
 * Geocode address using Nominatim (OpenStreetMap) - free, 1 req/sec
 */
async function geocodeAddress(address) {
  const parts = [
    address.street,
    address.district,
    address.city,
    address.postalCode,
    address.country
  ].filter(Boolean);
  const query = parts.join(', ');
  if (!query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'AutoPartsMarketplace/1.0 (Profile Address Map)'
    }
  });
  const data = await res.json();
  if (data && data[0]) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

// Default center: Damascus, Syria
const DEFAULT_CENTER = [33.5138, 36.2765];
const DEFAULT_ZOOM = 12;

/**
 * AddressMap - Displays address location on OpenStreetMap
 * Uses Nominatim for geocoding (free, 1 req/sec - use index for delay)
 */
export default function AddressMap({ address, className = '', height = '180px', index = 0 }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Use stored lat/lng if available
    if (address?.latitude != null && address?.longitude != null) {
      setCoords([Number(address.latitude), Number(address.longitude)]);
      setLoading(false);
      setError(false);
      return;
    }

    async function load() {
      // Stagger requests to respect Nominatim 1 req/sec limit
      await new Promise(r => setTimeout(r, index * 1200));
      if (cancelled) return;

      setLoading(true);
      setError(false);
      try {
        const result = await geocodeAddress(address || {});
        if (!cancelled) {
          setCoords(result);
          setError(!result);
        }
      } catch {
        if (!cancelled) {
          setCoords(null);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [address?.street, address?.city, address?.district, address?.country, address?.latitude, address?.longitude, index]);

  if (loading) {
    return (
      <div
        className={`rounded-xl bg-gray-100 dark:bg-dark-bg-tertiary animate-pulse flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-400 dark:text-gray-500">Loading map...</span>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div
        className={`rounded-xl bg-gray-100 dark:bg-dark-bg-tertiary flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-500 dark:text-gray-400">Location not found</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border ${className}`} style={{ height }}>
      <MapContainer
        center={coords}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <MapController center={coords} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>
            {address?.street}, {address?.city}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
