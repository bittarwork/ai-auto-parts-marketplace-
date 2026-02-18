import { useState, useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import ConfirmModal from '../components/common/ConfirmModal';
import { InlineLoader } from '../components/common/Spinner';
import vehicleService from '../services/vehicleService';
import {
  TruckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  CheckBadgeIcon,
  XMarkIcon
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
 * Full CRUD for user vehicles used in AI compatibility search
 */
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirmation
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
      setAlert({ type: 'error', message: 'Failed to load vehicles' });
    } finally {
      setLoading(false);
    }
  };

  // Open form for adding a new vehicle
  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  // Open form for editing an existing vehicle
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
    setAlert(null);
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
        setAlert({ type: 'success', message: editingId ? 'Vehicle updated' : 'Vehicle added' });
        setShowForm(false);
        loadVehicles();
      } else {
        setAlert({ type: 'error', message: res.message || 'Operation failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || 'An error occurred' });
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
        setAlert({ type: 'success', message: 'Vehicle deleted' });
        setDeleteTarget(null);
        loadVehicles();
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete vehicle' });
    } finally {
      setDeleting(false);
    }
  };

  const handleSetPrimary = async (vehicle) => {
    if (vehicle.isPrimary) return;
    try {
      const res = await vehicleService.setPrimary(vehicle._id);
      if (res.success) {
        setAlert({ type: 'success', message: `${vehicle.brand} ${vehicle.model} set as primary` });
        loadVehicles();
      }
    } catch {
      setAlert({ type: 'error', message: 'Failed to set primary vehicle' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container><InlineLoader text="Loading vehicles..." /></Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container size="md">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Vehicles</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Manage your vehicles for AI compatibility search
            </p>
          </div>
          <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openAdd}>
            Add Vehicle
          </Button>
        </div>

        {/* Alert */}
        {alert && (
          <Alert type={alert.type} message={alert.message} dismissible onDismiss={() => setAlert(null)} className="mb-6" />
        )}

        {/* Empty state */}
        {vehicles.length === 0 ? (
          <Card className="text-center py-16">
            <TruckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Vehicles Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add your vehicle to enable AI-powered parts compatibility search.
            </p>
            <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openAdd}>
              Add Your First Vehicle
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle._id} className={`relative ${vehicle.isPrimary ? 'ring-2 ring-primary-500' : ''}`}>
                {/* Primary badge */}
                {vehicle.isPrimary && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-semibold px-2 py-1 rounded-full">
                    <StarSolidIcon className="w-3 h-3" />
                    Primary
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <TruckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {vehicle.brand} {vehicle.model}
                      {vehicle.nickname && (
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          "{vehicle.nickname}"
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{vehicle.year}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {vehicle.engineType && (
                        <span className="text-xs bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {vehicle.engineType}
                        </span>
                      )}
                      {vehicle.transmission && (
                        <span className="text-xs bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {vehicle.transmission}
                        </span>
                      )}
                      {vehicle.mileage && (
                        <span className="text-xs bg-gray-100 dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {vehicle.mileage.toLocaleString()} km
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                  {!vehicle.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<StarIcon className="w-4 h-4" />}
                      onClick={() => handleSetPrimary(vehicle)}
                    >
                      Set Primary
                    </Button>
                  )}
                  {vehicle.isPrimary && (
                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium">
                      <CheckBadgeIcon className="w-4 h-4" /> Active
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                      onClick={() => openEdit(vehicle)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/20"
                      leftIcon={<TrashIcon className="w-4 h-4" />}
                      onClick={() => setDeleteTarget(vehicle)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Add/Edit Vehicle Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand <span className="text-error-500">*</span>
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formErrors.brand ? 'border-error-500' : 'border-gray-300 dark:border-dark-border'
                  }`}
                >
                  <option value="">Select brand...</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {formErrors.brand && <p className="mt-1 text-xs text-error-500">{formErrors.brand}</p>}
              </div>

              {/* Model + Year */}
              <div className="grid grid-cols-2 gap-3">
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

              {/* Engine + Transmission */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Engine Type"
                  name="engineType"
                  value={formData.engineType}
                  onChange={handleChange}
                  placeholder="e.g. 1.5L Turbo"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2.5 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select...</option>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Nickname + VIN */}
              <div className="grid grid-cols-2 gap-3">
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

              {/* Mileage */}
              <Input
                label="Mileage (km)"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g. 45000"
                min="0"
              />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2.5 bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
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

      {/* Delete Confirm Modal */}
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
