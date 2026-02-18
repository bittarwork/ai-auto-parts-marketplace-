import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

/**
 * Register Page
 */
export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(05|5)\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid Saudi phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else     if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setAlert(null);
    
    try {
      const phoneNormalized = formData.phone.replace(/[\s-]/g, '');
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: phoneNormalized,
        password: formData.password
      });
      
      if (response.success) {
        setAlert({ type: 'success', message: 'Account created successfully! Redirecting...' });
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setAlert({ type: 'error', message: response.message || 'Registration failed' });
      }
    } catch (error) {
      const msg = error?.message || error?.error || 'Registration failed. Please try again.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container size="sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join us to access AI-powered search and personalized recommendations
          </p>
        </div>
        
        <Card>
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              dismissible
              onDismiss={() => setAlert(null)}
              className="mb-6"
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<UserIcon className="w-5 h-5" />}
              placeholder="John Doe"
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<EnvelopeIcon className="w-5 h-5" />}
              placeholder="your@email.com"
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<PhoneIcon className="w-5 h-5" />}
              placeholder="05XXXXXXXX"
              helperText="Saudi phone number"
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              placeholder="••••••••"
              helperText="Min 6 chars, include uppercase, lowercase & number"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              placeholder="••••••••"
              required
            />
            
            <div className="pt-2">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  required
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
