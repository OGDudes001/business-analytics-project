import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';
import authWallpaper from '@/assets/auth-wallpaper.png';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data } = await api().post<{ message: string }>('/api/forgot-password', { email });
      setSuccessMessage(data.message);
      showToast('success', data.message);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not request a password reset.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-gray-900 bg-cover bg-center bg-fixed py-12 px-4 sm:px-6 lg:px-8 text-white flex items-center justify-center"
      style={{ backgroundImage: `url(${authWallpaper})` }}
    >
      <div className="absolute inset-0 bg-gray-950/70" />
      <div className="relative z-10 max-w-md w-full bg-gray-800/95 border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-600/20 text-orange-500 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-1">
            Enter your email address and, if there is an account for it, we’ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Email Address
            <span className="relative mt-1 block">
              <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required
              />
            </span>
          </label>

          {errorMessage && <p role="alert" className="rounded-lg border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">{errorMessage}</p>}
          {successMessage && <p role="status" className="rounded-lg border border-green-600 bg-green-900/40 p-3 text-sm text-green-200">{successMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 font-semibold rounded-lg transition duration-200"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
