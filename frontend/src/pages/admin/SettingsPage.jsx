import { useEffect, useState } from 'react';
import {
  Cog6ToothIcon,
  TruckIcon,
  CalculatorIcon,
  BellIcon,
  CheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getSettings, updateSettings } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Settings Page
 * Modern tab-based settings with icon tabs, smooth transitions.
 * NOTE: This page is under active development — more powerful features coming in future releases.
 */

const TABS = [
  { id: 'general', label: 'General', icon: Cog6ToothIcon },
  { id: 'shipping', label: 'Shipping', icon: TruckIcon },
  { id: 'tax', label: 'Tax', icon: CalculatorIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
];

const EMPTY = {
  siteName: '',
  contactEmail: '',
  currency: 'EUR',
  defaultLanguage: 'en',
  shippingFlatRate: 10,
  freeShippingThreshold: 100,
  taxRate: 0,
  lowStockThreshold: 5,
  notifyOnNewOrder: true,
  notifyOnLowStock: true,
};

// Label with optional hint
const Label = ({ children, hint }) => (
  <div className="mb-2">
    <label className="text-sm font-medium text-gray-700 block">{children}</label>
    {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
  </div>
);

// Styled input with focus states
const Input = ({ type = 'text', value, onChange, placeholder, min, max, step }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    max={max}
    step={step}
    className="w-full h-11 px-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
  />
);

// Styled select dropdown
const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full h-11 px-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 transition-all text-gray-800 shadow-sm"
  >
    {children}
  </select>
);

// Toggle switch component
const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative mt-0.5 flex-shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div
        className={`w-11 h-6 rounded-full transition-all duration-200 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      />
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</p>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  </label>
);

// Skeleton loader for settings page
const SettingsSkeleton = () => (
  <div className="w-full max-w-4xl space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 rounded-lg w-32" />
      <div className="h-3 bg-gray-100 rounded w-48" />
    </div>
    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-1 h-9 bg-gray-200 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-gray-100 rounded-2xl" />
    <div className="h-10 bg-gray-200 rounded-xl w-32" />
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings]   = useState(EMPTY);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSettings();
        setSettings({ ...EMPTY, ...res.data });
      } catch { toast.error('Failed to load settings'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const set = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Cog6ToothIcon className="w-5 h-5 text-blue-600" />
            </div>
            Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure your store preferences</p>
        </div>
      </div>

      {/* Future development banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/30 p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-100 border border-amber-200/60 flex items-center justify-center">
            <RocketLaunchIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-amber-600" />
              Under Active Development
            </h3>
            <p className="text-xs text-amber-800/90 mt-1.5 leading-relaxed">
              This settings page is being enhanced with more powerful features. Advanced options such as
              multi-currency support, advanced shipping zones, notification templates, and API configurations
              will be available in upcoming releases. Your feedback helps shape the roadmap.
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* General tab */}
        {activeTab === 'general' && (
          <div className="p-6 sm:p-7 space-y-6">
            <div>
              <Label hint="Displayed in browser tab and emails">Site Name</Label>
              <Input value={settings.siteName} onChange={e => set('siteName', e.target.value)} placeholder="Auto Parts Marketplace" />
            </div>
            <div>
              <Label hint="Used for order confirmations and support">Contact Email</Label>
              <Input type="email" value={settings.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="admin@autoparts.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label hint="All prices displayed in this currency">Currency</Label>
                <Select value={settings.currency} onChange={e => set('currency', e.target.value)}>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="SYP">ل.س Syrian Pound (SYP)</option>
                </Select>
              </div>
              <div>
                <Label>Default Language</Label>
                <Select value={settings.defaultLanguage} onChange={e => set('defaultLanguage', e.target.value)}>
                  <option value="en">English</option>
                  <option value="ar">العربية (Arabic)</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Shipping tab */}
        {activeTab === 'shipping' && (
          <div className="p-6 sm:p-7 space-y-6">
            <div>
              <Label hint="Fixed shipping fee applied to all orders">Flat Shipping Rate (EUR)</Label>
              <Input type="number" min="0" step="0.01" value={settings.shippingFlatRate} onChange={e => set('shippingFlatRate', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label hint="Orders above this value get free shipping. Set 0 to disable.">Free Shipping Threshold (EUR)</Label>
              <Input type="number" min="0" step="0.01" value={settings.freeShippingThreshold} onChange={e => set('freeShippingThreshold', parseFloat(e.target.value))} />
              {settings.freeShippingThreshold > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Free shipping on orders over {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(settings.freeShippingThreshold)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax tab */}
        {activeTab === 'tax' && (
          <div className="p-6 sm:p-7 space-y-6">
            <div>
              <Label hint="Applied as a percentage to all order totals">Tax Rate (%)</Label>
              <Input type="number" min="0" max="100" step="0.1" value={settings.taxRate} onChange={e => set('taxRate', parseFloat(e.target.value))} />
              {settings.taxRate > 0 && (
                <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200/60">
                  <p className="text-xs text-amber-700">
                    Example: A €100 order will include <strong>€{((100 * settings.taxRate) / 100).toFixed(2)} tax</strong>
                  </p>
                </div>
              )}
              {settings.taxRate === 0 && (
                <p className="text-xs text-gray-400 mt-2">Tax is currently disabled (rate is 0%)</p>
              )}
            </div>
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <div className="p-6 sm:p-7 space-y-6">
            <div>
              <Label hint="Show low stock alerts when product quantity reaches or falls below this number">Low Stock Threshold</Label>
              <div className="flex items-center gap-3">
                <Input type="number" min="1" value={settings.lowStockThreshold} onChange={e => set('lowStockThreshold', parseInt(e.target.value))} />
                <span className="text-xs text-gray-400 whitespace-nowrap">units</span>
              </div>
            </div>
            <div className="space-y-4">
              <Toggle
                checked={settings.notifyOnNewOrder}
                onChange={e => set('notifyOnNewOrder', e.target.checked)}
                label="New Order Notifications"
                hint="Show a notification in the dashboard when a new order is placed"
              />
              <Toggle
                checked={settings.notifyOnLowStock}
                onChange={e => set('notifyOnLowStock', e.target.checked)}
                label="Low Stock Notifications"
                hint={`Alert when any product drops to ${settings.lowStockThreshold} units or below`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
            saved
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200/50'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200/50 disabled:opacity-60 disabled:cursor-not-allowed'
          }`}
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {saved ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
        {saved && (
          <span className="text-xs text-emerald-600 font-medium">Your changes have been applied.</span>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
