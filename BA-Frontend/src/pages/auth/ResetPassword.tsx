import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Lock, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (token) {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    }
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!token) {
      const message = 'This password reset link is incomplete. Request a new one.';
      setErrorMessage(message);
      showToast('error', message);
      return;
    }
    if (password !== passwordConfirmation) {
      const message = 'The passwords do not match.';
      setErrorMessage(message);
      showToast('error', message);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api().post<{ message: string }>('/api/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccessMessage(data.message);
      showToast('success', data.message);
      setPassword('');
      setPasswordConfirmation('');
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not reset your password.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-600/20 text-orange-500 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-1">Choose a new password with at least 12 characters.</p>
        </div>

        {successMessage ? (
          <div className="space-y-4">
            <p role="status" className="rounded-lg border border-green-600 bg-green-900/40 p-3 text-sm text-green-200">{successMessage}</p>
            <Link to="/" className="block w-full rounded-lg bg-orange-600 py-3 text-center font-semibold hover:bg-orange-500">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-1 w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              New Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                className="mt-1 w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Confirm New Password
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                autoComplete="new-password"
                minLength={12}
                className="mt-1 w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </label>

            {errorMessage && <p role="alert" className="rounded-lg border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">{errorMessage}</p>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 font-semibold rounded-lg transition">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
