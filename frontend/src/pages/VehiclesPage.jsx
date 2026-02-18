import { useState, useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/common/ConfirmModal';
import vehicleService from '../services/vehicleService';
import {
  TruckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  CheckBadgeIcon,
  XMarkIcon,
  Cog6ToothIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Supported vehicle brands
const BRANDS = ['Chery', 'Geely', 'MG', 'Haval', 'Great Wall', 'Changan', 'BYD'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];

const EMPTY_FORM = {
  brand: '',
  model: '',
  year: '',
  engineType: '',
  transmission: '',
  nickname: '',
  vin: '',
  mileage: '',
  notes: ''
};

/**
 * Vehicles Page
 * Full CRUD for user vehicles - AI compatibility search
 */
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getVehicles();
      if (res.success) setVehicles(res.data || []);
    } catch {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (vehicle) => {
    setFormData({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      engineType: vehicle.engineType || '',
      transmission: vehicle.transmission || '',
      nickname: vehicle.nickname || '',
      vin: vehicle.vin || '',
      mileage: vehicle.mileage?.toString() || '',
      notes: vehicle.notes || ''
    });
    setFormErrors({});
    setEditingId(vehicle._id);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.brand) errs.brand = 'Brand is required';
    if (!formData.model || formData.model.trim().length < 2) errs.model = 'Model must be at least 2 characters';
    const yearNum = parseInt(formData.year);
    if (!formData.year || isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
      errs.year = `Year must be between 2000 and ${new Date().getFullYear() + 1}`;
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        brand: formData.brand,
        model: formData.model.trim(),
        year: parseInt(formData.year),
        engineType: formData.engineType || undefined,
        transmission: formData.transmission || undefined,
        nickname: formData.nickname.trim() || undefined,
        vin: formData.vin.trim() || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        notes: formData.notes.trim() || undefined
      };

      let res;
      if (editingId) {
        res = await vehicleService.updateVehicle(editingId, payload);
      } else {
        res = await vehicleService.addVehicle(payload);
      }

      if (res.success) {
        toast.success(editingId ? 'Vehicle updated' : 'Vehicle added');
        setShowForm(false);
        loadVehicles();
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch (err) {
      const msg = err?.errors?.[0]?.message || err?.message || 'An error occurred';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await vehicleService.deleteVehicle(deleteTarget._id);
      if (res.success) {
        toast.success('Vehicle deleted');
        setDeleteTarget(null);
        loadVehicles();
      }
    } catch {
      toast.error('Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetPrimary = async (vehicle) => {
    if (vehicle.isPrimary) return;
    try {
      const res = await vehicleService.setPrimary(vehicle._id);
      if (res.success) {
        toast.success(`${vehicle.brand} ${vehicle.model} set as primary`);
        loadVehicles();
      }
    } catch {
      toast.error('Failed to set primary vehicle');
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <Container size="sm">
          <div className="rounded-2xl overflow-hidden shadow-soft mb-6">
            <div className="h-36 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-primary-500/20 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-primary-900/30" />
            <div className="bg-white dark:bg-dark-bg-secondary px-6 pb-6 -mt-14 relative">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse" />
              <div className="mt-4 space-y-2">
                <div className="h-6 w-40 bg-gray-200 dark:bg-dark-bg-tertiary rounded animate-pulse" />
                <div className="h-4 w-56 bg-gray-100 dark:bg-dark-bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-dark-bg-tertiary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-dark-bg-tertiary rounded" />
                    <div className="h-4 w-16 bg-gray-100 dark:bg-dark-bg-tertiary rounded" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 w-20 bg-gray-100 dark:bg-dark-bg-tertiary rounded-full" />
                      <div className="h-6 w-24 bg-gray-100 dark:bg-dark-bg-tertiary rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex gap-2">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg" />
                  <div className="h-9 w-16 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg" />
                  <div className="h-9 w-16 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container size="sm">
        {/* Hero Header */}
        <div className="rounded-2xl overflow-hidden shadow-soft mb-6 animate-fade-in">
          <div className="h-36 bg-gradient-to-br from-blue-500 via-indigo-600 to-primary-600 dark:from-blue-600 dark:via-indigo-700 dark:to-primary-700" />
          <div className="bg-white dark:bg-dark-bg-secondary px-6 pb-6 -mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white dark:bg-dark-bg-secondary shadow-soft border border-gray-100 dark:border-dark-border flex-shrink-0">
                <TruckIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-4 sm:mt-0 sm:mb-1 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  My Vehicles
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your vehicles for AI-powered parts compatibility search
                </p>
                {vehicles.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1.5">
                    <CheckBadgeIcon className="w-4 h-4" />
                    {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                className="mt-4 sm:mt-0 sm:mb-1"
                leftIcon={<PlusIcon className="w-5 h-5" />}
                onClick={openAdd}
              >
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {vehicles.length === 0 ? (
            <Card className="text-center py-20 px-6 animate-slide-up">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
                <TruckIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Vehicles Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2 max-w-md mx-auto">
                Add your vehicle to enable AI-powered parts compatibility search and get personalized recommendations.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                Compatible with Chery, Geely, MG, Haval, Great Wall, Changan & BYD
              </p>
              <Button variant="primary" size="lg" leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openAdd}>
                Add Your First Vehicle
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle._id}
                  className={`relative overflow-hidden transition-all duration-200 animate-slide-up ${
                    vehicle.isPrimary
                      ? 'ring-2 ring-primary-500 shadow-soft-lg'
                      : 'hover:shadow-soft-lg hover:border-primary-200 dark:hover:border-primary-800'
                  }`}
                >
                  {vehicle.isPrimary && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full">
                      <StarSolidIcon className="w-3.5 h-3.5" /> Primary
                    </div>
                  )}

                  <div className="flex gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <TruckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0 pr-24">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      {vehicle.nickname && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          &quot;{vehicle.nickname}&quot;
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{vehicle.year}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {vehicle.engineType && (
                          <span className="text-xs font-medium bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg">
                            {vehicle.engineType}
                          </span>
                        )}
                        {vehicle.transmission && (
                          <span className="text-xs font-medium bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg">
                            <Cog6ToothIcon className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                            {vehicle.transmission}
                          </span>
                        )}
                        {vehicle.mileage != null && (
                          <span className="text-xs font-medium bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg">
                            {vehicle.mileage.toLocaleString()} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                    {!vehicle.isPrimary ? (
                      <button
                        onClick={() => handleSetPrimary(vehicle)}
                        className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline"
                      >
                        <StarIcon className="w-4 h-4" />
                        Set Primary
                      </button>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Active for compatibility
                      </span>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => openEdit(vehicle)}
                      className="p-2.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(vehicle)}
                      className="p-2.5 text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Add/Edit Vehicle Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Brand <span className="text-error-500">*</span>
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`w-full border rounded-xl px-4 py-3 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      formErrors.brand ? 'border-error-500' : 'border-gray-300 dark:border-dark-border'
                    }`}
                  >
                    <option value="">Select brand...</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {formErrors.brand && <p className="mt-1 text-xs text-error-500">{formErrors.brand}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Model *"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    error={formErrors.model}
                    placeholder="e.g. Tiggo 7"
                  />
                  <Input
                    label="Year *"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    error={formErrors.year}
                    placeholder="e.g. 2022"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-dark-border">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Engine Type"
                    name="engineType"
                    value={formData.engineType}
                    onChange={handleChange}
                    placeholder="e.g. 1.5L Turbo"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Transmission</label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-dark-border rounded-xl px-4 py-3 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select...</option>
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <Input
                  label="Mileage (km)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                  min="0"
                />
              </div>

              {/* Optional */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-dark-border">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Optional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder='e.g. "My Car"'
                  />
                  <Input
                    label="VIN"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    placeholder="Vehicle ID Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Any additional notes..."
                    className="w-full border border-gray-300 dark:border-dark-border rounded-xl px-4 py-3 bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  {editingId ? 'Save Changes' : 'Add Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete ${deleteTarget?.brand} ${deleteTarget?.model} (${deleteTarget?.year})?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
