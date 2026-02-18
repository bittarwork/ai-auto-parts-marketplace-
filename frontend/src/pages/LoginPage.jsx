import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useTranslation } from 'react-i18next';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Login Page
 */
export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const message = location.state?.message;
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await authService.login(formData.email, formData.password);
      if (response.success) {
        setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        setAlert({ type: 'error', message: response.message || 'Login failed' });
      }
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error?.message || error?.error || 'Login failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 flex items-center">
      <Container size="sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {message || 'Sign in to your account to continue'}
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
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<LockClosedIcon className="w-5 h-5" />}
              placeholder="••••••••"
              required
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}
