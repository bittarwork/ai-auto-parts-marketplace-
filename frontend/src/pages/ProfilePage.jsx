import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import authService from '../services/authService';
import { UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

/**
 * Profile Page
 * Update user name, phone
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || ''
        });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.phone && !/^(05|5)\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Invalid Saudi phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setAlert(null);
    try {
      const response = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone.replace(/[\s-]/g, '') || undefined
      });
      if (response.success) {
        setAlert({ type: 'success', message: 'Profile updated successfully' });
        setUser(response.data);
      } else {
        setAlert({ type: 'error', message: response.message || 'Update failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <Container>
          <div className="animate-pulse">Loading...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <Container size="sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        {alert && (
          <Alert type={alert.type} message={alert.message} dismissible onDismiss={() => setAlert(null)} className="mb-6" />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<UserIcon className="w-5 h-5" />}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              helperText="Email cannot be changed"
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<PhoneIcon className="w-5 h-5" />}
              placeholder="05XXXXXXXX"
            />
            <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
          </form>
        </Card>
      </Container>
    </div>
  );
}
