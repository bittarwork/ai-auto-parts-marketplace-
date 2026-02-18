import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import authService from '../services/authService';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * Forgot Password Page
 * Request password reset link
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setAlert({ type: 'error', message: 'Please enter a valid email' });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
        if (response.resetUrl) {
          setResetUrl(response.resetUrl);
        }
        setAlert({ type: 'success', message: response.message });
      } else {
        setAlert({ type: 'error', message: response.message || 'Request failed' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 flex items-center">
      <Container size="sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <Card>
          {alert && (
            <Alert type={alert.type} message={alert.message} dismissible onDismiss={() => setAlert(null)} className="mb-6" />
          )}
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Check your email for the password reset link. The link expires in 1 hour.
              </p>
              {resetUrl && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Development mode - use this link:</p>
                  <a
                    href={resetUrl}
                    className="text-primary-600 dark:text-primary-400 break-all hover:underline"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}
              <Link to="/login">
                <Button variant="primary">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                placeholder="your@email.com"
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
