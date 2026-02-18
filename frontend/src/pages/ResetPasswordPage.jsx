import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import authService from '../services/authService';
import { LockClosedIcon } from '@heroicons/react/24/outline';

/**
 * Reset Password Page
 * Set new password using token from email
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setAlert({ type: 'error', message: 'Invalid reset link. Please request a new one from Forgot Password.' });
    }
  }, [token]);

  const validate = () => {
    const newErrors = {};
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and a number';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!validate()) return;

    setLoading(true);
    setAlert(null);
    try {
      const response = await authService.resetPassword(token, password);
      if (response.success && response.data?.token) {
        authService.setToken(response.data.token);
        authService.setUser(response.data.user);
        window.dispatchEvent(new Event('auth:changed'));
        setSuccess(true);
        setAlert({ type: 'success', message: 'Password reset successfully! Redirecting to dashboard...' });
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
      } else {
        setAlert({ type: 'error', message: response.message || 'Reset failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || err?.error || 'Failed to reset password. The link may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 flex items-center">
      <Container size="sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>
        <Card>
          {alert && (
            <Alert type={alert.type} message={alert.message} dismissible onDismiss={() => setAlert(null)} className="mb-6" />
          )}
          {success ? (
            <div className="text-center">
              <p className="text-success-600 dark:text-success-400 font-medium">Password updated successfully!</p>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">The reset link is invalid or has expired.</p>
              <Link to="/forgot-password">
                <Button variant="primary">Request New Link</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
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
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                error={errors.confirmPassword}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                placeholder="••••••••"
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Reset Password
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Back to Login
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
