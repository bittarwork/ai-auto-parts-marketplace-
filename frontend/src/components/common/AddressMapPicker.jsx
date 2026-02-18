import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker (shared with AddressMap)
if (typeof L !== 'undefined' && L.Icon?.Default?.prototype?._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Default center: Damascus, Syria
const DEFAULT_CENTER = [33.5138, 36.2765];

/**
 * Reverse geocode: get address from lat/lng using Nominatim
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AutoPartsMarketplace/1.0 (Profile Address Map)' }
  });
  const data = await res.json();
  if (!data || !data.address) return null;
  const a = data.address;
  return {
    street: [a.road, a.house_number, a.building].filter(Boolean).join(', ') || a.street || '',
    city: a.city || a.town || a.village || a.municipality || '',
    district: a.suburb || a.neighbourhood || a.quarter || '',
    postalCode: a.postcode || '',
    country: a.country || 'Syria'
  };
}

/**
 * LocationMarker - draggable/clickable marker, syncs with parent
 */
function LocationMarker({ position, onPositionChange, draggable = true }) {
  const map = useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });

  useEffect(() => {
    if (position && map) {
      map.setView(position, Math.max(map.getZoom(), 15));
    }
  }, [position, map]);

  if (!position) return null;

  const eventHandlers = draggable
    ? {
        dragend() {
          const marker = this;
          const latlng = marker.getLatLng();
          onPositionChange([latlng.lat, latlng.lng]);
        }
      }
    : {};

  return (
    <Marker
      position={position}
      draggable={draggable}
      eventHandlers={eventHandlers}
    />
  );
}

/**
 * AddressMapPicker - Interactive map for selecting address location
 * - Use current location (GPS)
 * - Click on map to set marker
 * - Drag marker to adjust
 * - Reverse geocode to fill address form
 */
export default function AddressMapPicker({
  value = null,        // [lat, lng] or null
  onChange,            // (coords, addressData) => void
  height = '240px',
  className = ''
}) {
  const [position, setPosition] = useState(value || null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Sync external value
  useEffect(() => {
    if (value && Array.isArray(value) && value.length >= 2) {
      setPosition([value[0], value[1]]);
    } else {
      setPosition(null);
    }
  }, [value?.[0], value?.[1]]);

  const handlePositionChange = useCallback(async (coords) => {
    setPosition(coords);
    setGeoError(null);
    if (!onChange) return;
    onChange(coords);
    // Reverse geocode to get address suggestion
    try {
      const addr = await reverseGeocode(coords[0], coords[1]);
      if (addr && onChange) {
        onChange(coords, addr);
      }
    } catch {
      // Still pass coords even if reverse geocode fails
      onChange(coords);
    }
  }, [onChange]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported');
      return;
    }
    setGettingLocation(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setGettingLocation(false);
        handlePositionChange(coords);
      },
      (err) => {
        setGettingLocation(false);
        setGeoError(err.message === 'User denied the request for Geolocation.'
          ? 'Location access denied'
          : 'Could not get location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const center = position || DEFAULT_CENTER;
  const zoom = position ? 17 : 10;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select location on map</span>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50"
        >
          {gettingLocation ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Getting location...
            </>
          ) : (
            <>
              <LocationIcon />
              Use my location
            </>
          )}
        </button>
      </div>
      {geoError && (
        <p className="text-sm text-error-600 dark:text-error-400 mb-2">{geoError}</p>
      )}
      <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-dark-border" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0 cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} draggable={!!position} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Click on the map to set your address location, or drag the marker to adjust
      </p>
    </div>
  );
}

// Simple location pin icon
function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
