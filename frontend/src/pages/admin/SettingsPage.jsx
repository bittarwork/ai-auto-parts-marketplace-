import { useEffect, useState } from 'react';
import {
  Cog6ToothIcon, TruckIcon, CalculatorIcon, BellIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { getSettings, updateSettings } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Settings Page
 * Modern tab-based settings with icon tabs, smooth transitions
 */

const TABS = [
  { id: 'general',       label: 'General',       icon: Cog6ToothIcon },
  { id: 'shipping',      label: 'Shipping',      icon: TruckIcon },
  { id: 'tax',           label: 'Tax',           icon: CalculatorIcon },
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
  notifyOnLowStock: true
};

const Label = ({ children, hint }) => (
  <div className="mb-2">
    <label className="text-sm font-medium text-gray-700">{children}</label>
    {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const Input = ({ type = 'text', value, onChange, placeholder, min, max, step }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    max={max}
    step={step}
    className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
  />
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800"
  >
    {children}
  </select>
);

const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative mt-0.5 flex-shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`} />
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</p>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  </label>
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Settings</h2>
        <p className="text-xs text-gray-400 mt-0.5">Configure your store preferences</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-1.5 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm divide-y divide-gray-100">
        {/* ── General ── */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-5">
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

        {/* ── Shipping ── */}
        {activeTab === 'shipping' && (
          <div className="p-6 space-y-5">
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

        {/* ── Tax ── */}
        {activeTab === 'tax' && (
          <div className="p-6 space-y-5">
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

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
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
      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
          saved
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 disabled:opacity-50'
        }`}
      >
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saved ? <><CheckIcon className="w-4 h-4" />Saved!</> : 'Save Changes'}
      </button>
    </div>
  );
};

export default SettingsPage;
