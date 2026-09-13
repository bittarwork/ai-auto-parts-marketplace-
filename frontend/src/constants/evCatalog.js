/**
 * Shared EV catalog constants for storefront and admin forms.
 */

export const EV_BRANDS = ['Tesla', 'BYD', 'Hyundai', 'Kia', 'Nissan', 'Volkswagen', 'MG', 'BMW'];

export const EV_MODELS = {
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  BYD: ['Atto 3', 'Seal', 'Dolphin', 'Han'],
  Hyundai: ['Ioniq 5', 'Ioniq 6', 'Kona Electric'],
  Kia: ['EV6', 'Niro EV', 'EV9'],
  Nissan: ['Leaf', 'Ariya'],
  Volkswagen: ['ID.3', 'ID.4', 'ID.Buzz'],
  MG: ['MG4', 'MG ZS EV'],
  BMW: ['iX3', 'i4', 'iX']
};

export const DRIVETRAINS = ['RWD', 'FWD', 'AWD', 'Dual-Motor'];
export const CONNECTOR_TYPES = ['CCS2', 'Type2', 'NACS', 'CHAdeMO'];
export const VOLTAGE_CLASSES = ['12V', '400V', '800V'];
export const TRANSMISSIONS = ['Automatic', 'Single-Speed'];

export const EV_FILTER_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'battery-energy', label: 'Battery & Energy' },
  { value: 'charging', label: 'Charging Equipment' },
  { value: 'electric-drive', label: 'Electric Drive' },
  { value: 'thermal', label: 'Thermal Management' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'suspension-tires', label: 'Suspension & Tires' },
  { value: 'sensors-adas', label: 'Sensors & ADAS' },
  { value: 'cabin-electronics', label: 'Cabin Electronics' },
  { value: 'body-exterior', label: 'Body & Exterior' }
];

export const STORE_NAME = 'EV Auto Parts';
