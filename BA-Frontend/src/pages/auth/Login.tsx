import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/common/Loading';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';
import authWallpaper from '@/assets/auth-wallpaper.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api().post('/api/login', { email, password });
      const userData = response.data.user;

      login(userData, response.data.token);
      showToast('success', 'You are now signed in.');

      const isAdmin = userData.role === 'admin';

      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Invalid email or password.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${authWallpaper})` }}
      />
      <div className="absolute inset-0 bg-gray-950/60" />

      <div className="relative z-10 w-full max-w-md bg-gray-900/90 border border-gray-700 p-8 rounded-2xl shadow-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm text-red-200 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email Address" 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 font-semibold rounded-lg transition duration-200 cursor-pointer"
          >
            Login
          </button>
        </form>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <Link to="/forgot-password" className="hover:underline">Forgot Password?</Link>
          <Link to="/register" className="hover:underline text-orange-400">Don't have an account? Sign Up</Link>
        </div>
      </div>
    </div>
  );
}