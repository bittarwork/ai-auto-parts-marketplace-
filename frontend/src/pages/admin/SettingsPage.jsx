import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin Settings Page
 * Tabs: General | Shipping | Tax | Notifications
 */

const TABS = ['General', 'Shipping', 'Tax', 'Notifications'];

const EMPTY_SETTINGS = {
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

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSettings();
        setSettings({ ...EMPTY_SETTINGS, ...res.data });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'text-sm font-medium text-gray-700 mb-1.5 block';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* General */}
        {activeTab === 'General' && (
          <>
            <div>
              <label className={labelClass}>Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className={inputClass}
                placeholder="Auto Parts Marketplace"
              />
            </div>
            <div>
              <label className={labelClass}>Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className={inputClass}
                placeholder="admin@autoparts.com"
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className={inputClass}
              >
                <option value="EUR">EUR (Euro €)</option>
                <option value="SYP">SYP (Syrian Pound ل.س)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Default Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                className={inputClass}
              >
                <option value="en">English</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </div>
          </>
        )}

        {/* Shipping */}
        {activeTab === 'Shipping' && (
          <>
            <div>
              <label className={labelClass}>Flat Shipping Rate (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.shippingFlatRate}
                onChange={(e) => handleChange('shippingFlatRate', parseFloat(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Applied to all orders unless free shipping threshold is met</p>
            </div>
            <div>
              <label className={labelClass}>Free Shipping Threshold (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping (0 = disabled)</p>
            </div>
          </>
        )}

        {/* Tax */}
        {activeTab === 'Tax' && (
          <div>
            <label className={labelClass}>Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              Applied to all orders. Set to 0 to disable tax.
              {settings.taxRate > 0 && (
                <span className="ml-1 text-blue-600">
                  Example: €100 order → tax = €{((100 * settings.taxRate) / 100).toFixed(2)}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'Notifications' && (
          <>
            <div>
              <label className={labelClass}>Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                Products with stock at or below this number will appear in low stock alerts
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewOrder}
                  onChange={(e) => handleChange('notifyOnNewOrder', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notify on New Order</p>
                  <p className="text-xs text-gray-400">Receive a notification whenever a new order is placed</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLowStock}
                  onChange={(e) => handleChange('notifyOnLowStock', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">Notify on Low Stock</p>
                  <p className="text-xs text-gray-400">Receive a notification when a product reaches low stock threshold</p>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {saving && (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        )}
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;
