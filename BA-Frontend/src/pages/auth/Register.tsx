import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Building2, Lock, User } from 'lucide-react';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';
import authWallpaper from '@/assets/auth-wallpaper.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    gender: 'Male',
    address: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    dateStarted: '',
    password: '',
    confirmPassword: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      const message = 'Passwords do not match.';
      setErrorMessage(message);
      showToast('error', message);
      return;
    }
    if (formData.password.length < 8) {
      const message = 'Your password must be at least 8 characters long.';
      setErrorMessage(message);
      showToast('error', message);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (profileImage) {
        data.append('profileImage', profileImage);
      }
      if (businessImage) {
        data.append('businessImage', businessImage);
      }

      await api().post('/api/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', 'Your account was created. You can now sign in.');
      navigate('/');
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Something went wrong during registration.');
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
      <div className="relative z-10 max-w-3xl w-full bg-gray-800/95 border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">
            Register your PisoNet business and profile details
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Administrator access is assigned separately by the platform owner.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Section 1: Personal Profile Details */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
              <User className="w-5 h-5" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dudes Aro Inihao"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="09123456789"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Home Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Cordova, Cebu, Philippines"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Profile Details */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-4 border-b border-gray-700 pb-2 pt-2">
              <Building2 className="w-5 h-5" /> Business Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Buddy Internetan"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  placeholder="PisoNet Arcade / Internet Cafe"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date Started</label>
                <input
                  type="date"
                  name="dateStarted"
                  value={formData.dateStarted}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Profile Image / Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBusinessImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Business Address</label>
                <input
                  type="text"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="Lapu-Lapu, Cebu"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security */}
          <div>
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-4 border-b border-gray-700 pb-2 pt-2">
              <Lock className="w-5 h-5" /> Security Credentials
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div role="alert" className="rounded-lg border border-red-500 bg-red-900/50 p-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 font-semibold rounded-lg transition duration-200 mt-6 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Registering Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/" className="text-orange-400 hover:underline font-medium">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}