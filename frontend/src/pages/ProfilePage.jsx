import { useState, useEffect } from 'react';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import ConfirmModal from '../components/common/ConfirmModal';
import AddressMap from '../components/common/AddressMap';
import AddressMapPicker from '../components/common/AddressMapPicker';
import authService from '../services/authService';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  MapPinIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  XMarkIcon,
  UserCircleIcon,
  KeyIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const EMPTY_ADDRESS = {
  label: 'Home',
  street: '',
  city: '',
  district: '',
  postalCode: '',
  country: 'Syria',
  phone: '',
  isDefault: false,
  latitude: null,
  longitude: null
};

// Helper to get user initials for avatar
const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Profile Page - Display-first, edit on demand
 * Sections: Profile Info (display), Security (display), Addresses (with maps)
 */
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab navigation: 'info' | 'security' | 'addresses'
  const [activeTab, setActiveTab] = useState('info');

  // Edit modes - show form only when user requests
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Basic profile form
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});

  // Change password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(null);
  const [pwErrors, setPwErrors] = useState({});

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [addrAlert, setAddrAlert] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [addrErrors, setAddrErrors] = useState({});
  const [addrSaving, setAddrSaving] = useState(false);
  const [deleteAddrTarget, setDeleteAddrTarget] = useState(null);
  const [deletingAddr, setDeletingAddr] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setProfileForm({ name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '' });
        setAddresses(res.data.addresses || []);
      }
    } catch {
      setProfileAlert({ type: 'error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  // ── Basic Profile ──────────────────────────────────────────

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name || profileForm.name.length < 2) errs.name = 'Name must be at least 2 characters';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setProfileSaving(true);
    setProfileAlert(null);
    try {
      const res = await authService.updateProfile({ name: profileForm.name, phone: profileForm.phone || undefined });
      if (res.success) {
        setProfileAlert({ type: 'success', message: 'Profile updated successfully' });
        setUser(res.data);
        setEditingProfile(false);
      } else {
        setProfileAlert({ type: 'error', message: res.message || 'Update failed' });
      }
    } catch (err) {
      setProfileAlert({ type: 'error', message: err?.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
    setProfileErrors({});
    setEditingProfile(false);
  };

  // ── Change Password ────────────────────────────────────────

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
    if (pwErrors[name]) setPwErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'New password must be at least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!validatePw()) return;
    setPwSaving(true);
    setPwAlert(null);
    try {
      const res = await authService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      if (res.success) {
        setPwAlert({ type: 'success', message: 'Password changed successfully' });
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setEditingPassword(false);
      } else {
        setPwAlert({ type: 'error', message: res.message || 'Failed to change password' });
      }
    } catch (err) {
      setPwAlert({ type: 'error', message: err?.message || 'Failed to change password' });
    } finally {
      setPwSaving(false);
    }
  };

  const cancelPasswordEdit = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwErrors({});
    setEditingPassword(false);
  };

  // ── Addresses ─────────────────────────────────────────────

  const openAddAddress = () => {
    setAddrForm(EMPTY_ADDRESS);
    setAddrErrors({});
    setEditingAddrId(null);
    setShowAddrForm(true);
  };

  const openEditAddress = (addr) => {
    setAddrForm({
      label: addr.label || 'Home',
      street: addr.street || '',
      city: addr.city || '',
      district: addr.district || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Syria',
      phone: addr.phone || '',
      isDefault: addr.isDefault || false,
      latitude: addr.latitude ?? null,
      longitude: addr.longitude ?? null
    });
    setAddrErrors({});
    setEditingAddrId(addr._id);
    setShowAddrForm(true);
  };

  const handleAddrChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddrForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (addrErrors[name]) setAddrErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMapLocationChange = (coords, addressData) => {
    setAddrForm(prev => ({
      ...prev,
      latitude: coords[0],
      longitude: coords[1],
      ...(addressData && {
        street: addressData.street || prev.street,
        city: addressData.city || prev.city,
        district: addressData.district || prev.district,
        postalCode: addressData.postalCode || prev.postalCode,
        country: addressData.country || prev.country
      })
    }));
  };

  const validateAddr = () => {
    const errs = {};
    if (!addrForm.street.trim()) errs.street = 'Street address is required';
    if (!addrForm.city.trim()) errs.city = 'City is required';
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddr()) return;
    setAddrSaving(true);
    setAddrAlert(null);
    try {
      let res;
      if (editingAddrId) {
        res = await authService.updateAddress(editingAddrId, addrForm);
      } else {
        res = await authService.addAddress(addrForm);
      }
      if (res.success) {
        setAddresses(res.data);
        setAddrAlert({ type: 'success', message: editingAddrId ? 'Address updated' : 'Address added' });
        setShowAddrForm(false);
      } else {
        setAddrAlert({ type: 'error', message: res.message || 'Failed to save address' });
      }
    } catch (err) {
      setAddrAlert({ type: 'error', message: err?.message || 'Failed to save address' });
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddr = async () => {
    if (!deleteAddrTarget) return;
    setDeletingAddr(true);
    try {
      const res = await authService.deleteAddress(deleteAddrTarget._id);
      if (res.success) {
        setAddresses(res.data);
        setAddrAlert({ type: 'success', message: 'Address deleted' });
      }
    } catch {
      setAddrAlert({ type: 'error', message: 'Failed to delete address' });
    } finally {
      setDeletingAddr(false);
      setDeleteAddrTarget(null);
    }
  };

  const handleSetDefaultAddr = async (addr) => {
    if (addr.isDefault) return;
    try {
      const res = await authService.setDefaultAddress(addr._id);
      if (res.success) {
        setAddresses(res.data);
        setAddrAlert({ type: 'success', message: 'Default address updated' });
      }
    } catch {
      setAddrAlert({ type: 'error', message: 'Failed to set default address' });
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
        <Container size="sm">
          <div className="rounded-2xl overflow-hidden mb-6">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 animate-pulse" />
            <div className="bg-white dark:bg-dark-bg-secondary px-6 pb-6 -mt-12 relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-dark-bg-tertiary animate-pulse border-4 border-white dark:border-dark-bg-secondary" />
              <div className="mt-4 space-y-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-dark-bg-tertiary rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 dark:bg-dark-bg-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-dark-bg-tertiary rounded-lg animate-pulse" />
            ))}
          </div>
          <Card>
            <div className="space-y-4">
              <div className="h-10 bg-gray-100 dark:bg-dark-bg-tertiary rounded animate-pulse" />
              <div className="h-10 bg-gray-100 dark:bg-dark-bg-tertiary rounded animate-pulse" />
              <div className="h-10 bg-gray-100 dark:bg-dark-bg-tertiary rounded animate-pulse" />
              <div className="h-12 w-32 bg-gray-200 dark:bg-dark-bg-tertiary rounded animate-pulse mt-4" />
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Profile', icon: UserCircleIcon },
    { id: 'security', label: 'Security', icon: KeyIcon },
    { id: 'addresses', label: 'Addresses', icon: BuildingOffice2Icon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container size="sm">
        {/* Profile Hero Header */}
        <div className="rounded-2xl overflow-hidden shadow-soft mb-6 animate-fade-in">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 dark:from-primary-600 dark:via-primary-700 dark:to-primary-800" />
          <div className="bg-white dark:bg-dark-bg-secondary px-6 pb-6 -mt-16 sm:-mt-20 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-dark-bg-secondary border-4 border-white dark:border-dark-bg-secondary shadow-soft flex-shrink-0 ring-2 ring-primary-100 dark:ring-primary-900/50">
                {getInitials(user?.name)}
              </div>
              <div className="mt-4 sm:mt-0 sm:mb-1 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.name || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  {user?.email}
                </p>
                {addresses.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" />
                    {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-bg-secondary text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-dark-border'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* ── Profile Tab: Display first, edit on demand ────── */}
          {activeTab === 'info' && (
            <Card className="animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your personal details</p>
                  </div>
                </div>
                {!editingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<PencilSquareIcon className="w-4 h-4" />}
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {profileAlert && (
                <Alert type={profileAlert.type} message={profileAlert.message} dismissible onDismiss={() => setProfileAlert(null)} className="mb-4" />
              )}

              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    error={profileErrors.name}
                    leftIcon={<UserIcon className="w-5 h-5" />}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                    helperText="Email cannot be changed"
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    leftIcon={<PhoneIcon className="w-5 h-5" />}
                    placeholder="+963XXXXXXXXX"
                  />
                  <div className="flex gap-3">
                    <Button type="submit" variant="primary" loading={profileSaving}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelProfileEdit} disabled={profileSaving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-tertiary/30">
                    <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-tertiary/30">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-bg-tertiary/30">
                    <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user?.phone || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── Security Tab: Display first, change password on demand ─ */}
          {activeTab === 'security' && (
            <Card className="animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <LockClosedIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password & Security</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account security</p>
                  </div>
                </div>
                {!editingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<KeyIcon className="w-4 h-4" />}
                    onClick={() => setEditingPassword(true)}
                  >
                    Change Password
                  </Button>
                )}
              </div>

              {pwAlert && (
                <Alert type={pwAlert.type} message={pwAlert.message} dismissible onDismiss={() => setPwAlert(null)} className="mb-4" />
              )}

              {editingPassword ? (
                <form onSubmit={handlePwSubmit} className="space-y-5">
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    error={pwErrors.currentPassword}
                    leftIcon={<LockClosedIcon className="w-5 h-5" />}
                    placeholder="••••••••"
                  />
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    error={pwErrors.newPassword}
                    leftIcon={<LockClosedIcon className="w-5 h-5" />}
                    placeholder="••••••••"
                    helperText="Minimum 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    error={pwErrors.confirmPassword}
                    leftIcon={<LockClosedIcon className="w-5 h-5" />}
                    placeholder="••••••••"
                  />
                  <div className="flex gap-3">
                    <Button type="submit" variant="primary" loading={pwSaving}>
                      Change Password
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelPasswordEdit} disabled={pwSaving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-dark-bg-tertiary/30 border border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                      <CheckBadgeIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Your password is securely stored</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Use the button above to change your password when needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── Addresses Tab: with maps ───────────────────── */}
          {activeTab === 'addresses' && (
            <Card className="animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {addresses.length} address{addresses.length !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="sm" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={openAddAddress}>
                  Add Address
                </Button>
              </div>

              {addrAlert && (
                <Alert type={addrAlert.type} message={addrAlert.message} dismissible onDismiss={() => setAddrAlert(null)} className="mb-4" />
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg-tertiary/30">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-bg-tertiary flex items-center justify-center mx-auto mb-4">
                    <MapPinIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No saved addresses</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Add your delivery addresses for faster checkout and easier order tracking.
                  </p>
                  <Button variant="primary" leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openAddAddress}>
                    Add your first address
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        addr.isDefault
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm'
                          : 'border-gray-200 dark:border-dark-border hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-soft'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                              <MapPinIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {addr.label || 'Address'}
                                </h3>
                                {addr.isDefault && (
                                  <span className="flex items-center gap-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                                    <CheckBadgeIcon className="w-3 h-3" /> Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.street}</p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {addr.city}{addr.district ? `, ${addr.district}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}
                              </p>
                              <p className="text-gray-500 dark:text-gray-500 text-sm">{addr.country}</p>
                              {addr.phone && (
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 flex items-center gap-1">
                                  <PhoneIcon className="w-3.5 h-3.5" /> {addr.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddr(addr)}
                                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline px-2 py-1"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => openEditAddress(addr)}
                              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteAddrTarget(addr)}
                              className="p-2 text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Map for this address */}
                        <AddressMap address={addr} height="200px" className="mt-4" index={addresses.indexOf(addr)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </Container>

      {/* Address Form Modal */}
      {showAddrForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowAddrForm(false)}
        >
          <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAddrId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setShowAddrForm(false)}
                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddrSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
                  <select
                    name="label"
                    value={addrForm.label}
                    onChange={handleAddrChange}
                    className="w-full border border-gray-300 dark:border-dark-border rounded-xl px-4 py-2.5 bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="Phone"
                  name="phone"
                  value={addrForm.phone}
                  onChange={handleAddrChange}
                  placeholder="+963XXXXXXXXX"
                />
              </div>

              <Input
                label="Street Address *"
                name="street"
                value={addrForm.street}
                onChange={handleAddrChange}
                error={addrErrors.street}
                placeholder="Street, building number..."
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City *"
                  name="city"
                  value={addrForm.city}
                  onChange={handleAddrChange}
                  error={addrErrors.city}
                  placeholder="Damascus"
                />
                <Input
                  label="District"
                  name="district"
                  value={addrForm.district}
                  onChange={handleAddrChange}
                  placeholder="Neighborhood"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  name="postalCode"
                  value={addrForm.postalCode}
                  onChange={handleAddrChange}
                  placeholder="00000"
                />
                <Input
                  label="Country"
                  name="country"
                  value={addrForm.country}
                  onChange={handleAddrChange}
                  placeholder="Syria"
                />
              </div>

              <AddressMapPicker
                value={addrForm.latitude != null && addrForm.longitude != null
                  ? [addrForm.latitude, addrForm.longitude]
                  : null
                }
                onChange={handleMapLocationChange}
                height="220px"
                className="mt-4"
              />

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary/50 transition-colors">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addrForm.isDefault}
                  onChange={handleAddrChange}
                  className="w-4 h-4 rounded border-gray-300 dark:border-dark-border text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Set as default address</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddrForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={addrSaving}>
                  {editingAddrId ? 'Save Changes' : 'Add Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Address Confirm Modal */}
      <ConfirmModal
        open={!!deleteAddrTarget}
        onClose={() => setDeleteAddrTarget(null)}
        onConfirm={handleDeleteAddr}
        title="Delete Address"
        message={`Delete the address at "${deleteAddrTarget?.street}, ${deleteAddrTarget?.city}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deletingAddr}
      />
    </div>
  );
}
