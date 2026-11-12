import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Tag,
  Clock,
} from 'lucide-react';
import EditProfileModal from '@/components/modals/EditProfileModal';
import EditBusinessModal from '@/components/modals/EditBusinessModal';
import Loading from '@/components/common/Loading';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import type { BusinessProfileData, ProfileData } from '@/types/profile';
import { useToast } from '@/context/ToastContext';

interface ApiProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  birthday: string;
  address: string;
  profile_image_url: string | null;
  role: 'admin' | 'user';
  business: {
    business_name: string;
    business_type: string;
    business_address: string;
    date_started: string;
    business_image_url: string | null;
  } | null;
}

const EMPTY_PROFILE: ProfileData = {
  name: '',
  email: '',
  phoneNumber: '',
  birthday: '',
  address: '',
  profileImageUrl: null,
};

const EMPTY_BUSINESS: BusinessProfileData = {
  businessName: '',
  businessType: '',
  businessAddress: '',
  dateStarted: '',
  businessImageUrl: null,
};

function mapProfile(user: ApiProfile): ProfileData {
  return {
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    birthday: user.birthday.slice(0, 10),
    address: user.address,
    profileImageUrl: user.profile_image_url,
  };
}

function mapBusiness(user: ApiProfile): BusinessProfileData {
  return {
    businessName: user.business?.business_name ?? '',
    businessType: user.business?.business_type ?? '',
    businessAddress: user.business?.business_address ?? '',
    dateStarted: user.business?.date_started?.slice(0, 10) ?? '',
    businessImageUrl: user.business?.business_image_url ?? null,
  };
}

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'security'>('profile');
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [business, setBusiness] = useState(EMPTY_BUSINESS);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [savingPassword, setSavingPassword] = useState(false);
  const [pageError, setPageError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let active = true;
    api().get<{ user: ApiProfile }>('/api/profile')
      .then(({ data }) => {
        if (!active) return;
        setProfile(mapProfile(data.user));
        setBusiness(mapBusiness(data.user));
        setHasBusiness(data.user.business !== null);
        updateUser(data.user);
      })
      .catch((error: unknown) => {
        if (active) {
          const message = getApiErrorMessage(error, 'Could not load your profile.');
          setPageError(message);
          showToast('error', message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, showToast, updateUser]);

  const handleProfileSave = async (updated: ProfileData, image: File | null) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('name', updated.name);
    formData.append('email', updated.email);
    formData.append('phoneNumber', updated.phoneNumber);
    formData.append('birthday', updated.birthday);
    formData.append('address', updated.address);
    if (image) formData.append('profileImage', image);

    const { data } = await api().post<{ user: ApiProfile }>('/api/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setProfile(mapProfile(data.user));
    updateUser(data.user);
  };

  const handleBusinessSave = async (updated: BusinessProfileData, image: File | null) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('businessName', updated.businessName);
    formData.append('businessType', updated.businessType);
    formData.append('businessAddress', updated.businessAddress);
    formData.append('dateStarted', updated.dateStarted);
    if (image) formData.append('businessImage', image);

    const { data } = await api().post<{ business: ApiProfile['business'] }>('/api/profile/business', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.business) {
      setBusiness({
        businessName: data.business.business_name,
        businessType: data.business.business_type,
        businessAddress: data.business.business_address,
        dateStarted: data.business.date_started.slice(0, 10),
        businessImageUrl: data.business.business_image_url,
      });
    }
  };

  const handlePasswordChange = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (passwords.newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters long.');
      showToast('error', 'Your new password must be at least 8 characters long.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('The new passwords do not match.');
      showToast('error', 'The new passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await api().put<{ message: string }>('/api/profile/password', passwords);
      setPasswordMessage(data.message);
      showToast('success', data.message);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not change your password.');
      setPasswordError(message);
      showToast('error', message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <Loading message="Loading your profile..." />;

  if (pageError) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p role="alert" className="mb-4 text-red-700">{pageError}</p>
        <button onClick={() => { setPageError(''); setLoading(true); setReloadKey((key) => key + 1); }} className="rounded-lg bg-blue-900 px-5 py-2 font-semibold text-white hover:bg-blue-800">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-200 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-[#1e3a8a] text-white flex flex-col shadow-lg">
        <nav className="flex flex-col py-4 space-y-1">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-6 py-3.5 text-left font-medium transition ${activeTab === 'profile' ? 'bg-white/20 border-l-4 border-white font-bold' : 'hover:bg-white/10'}`}>
            <User className="w-5 h-5" /> Profile Details
          </button>
          <button onClick={() => setActiveTab('business')} className={`flex items-center gap-3 px-6 py-3.5 text-left font-medium transition ${activeTab === 'business' ? 'bg-white/20 border-l-4 border-white font-bold' : 'hover:bg-white/10'}`}>
            <Building2 className="w-5 h-5" /> Business Details
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-6 py-3.5 text-left font-medium transition ${activeTab === 'security' ? 'bg-white/20 border-l-4 border-white font-bold' : 'hover:bg-white/10'}`}>
            <Lock className="w-5 h-5" /> Change Password
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Profile Details</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center"><User className="w-12 h-12 text-gray-400" /></div>
                )}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-sm">
                  <Detail icon={<User />} label="Name" value={profile.name} />
                  <Detail icon={<Mail />} label="Email" value={profile.email} />
                  <Detail icon={<Phone />} label="Phone Number" value={profile.phoneNumber} />
                  <Detail icon={<Calendar />} label="Birthday" value={profile.birthday} />
                  <Detail icon={<MapPin />} label="Address" value={profile.address} wide />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end">
                <button onClick={() => { setIsEditProfileOpen(true); showToast('info', 'Edit your profile details.'); }} className="px-6 py-2 bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 font-semibold rounded-full shadow-sm transition">Edit Profile</button>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Business Details</h2>
              {business.businessImageUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                  <img src={business.businessImageUrl} alt="Business banner" className="w-full h-full object-cover" />
                </div>
              )}
              {hasBusiness ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-2">
                  <Detail icon={<Building2 />} label="Business Name" value={business.businessName} />
                  <Detail icon={<Tag />} label="Business Type" value={business.businessType} />
                  <Detail icon={<MapPin />} label="Business Address" value={business.businessAddress} wide />
                  <Detail icon={<Clock />} label="Business Started Date" value={business.dateStarted} wide />
                </div>
              ) : (
                <p className="rounded-lg bg-gray-100 p-4 text-gray-700">No business details are associated with this account.</p>
              )}
              <div className="pt-4 border-t flex justify-end">
                <button onClick={() => { setIsEditBusinessOpen(true); showToast('info', 'Edit your business details.'); }} disabled={!hasBusiness} className="px-6 py-2 bg-white border border-gray-400 hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-semibold rounded-full shadow-sm transition">Edit Business</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Change Password</h2>
              <div className="space-y-4 max-w-md">
                <PasswordField label="Current password" value={passwords.currentPassword} onChange={(value) => setPasswords({ ...passwords, currentPassword: value })} />
                <PasswordField label="New password" value={passwords.newPassword} onChange={(value) => setPasswords({ ...passwords, newPassword: value })} minLength={8} />
                <PasswordField label="Confirm new password" value={passwords.confirmPassword} onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })} minLength={8} />
              </div>
              {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
              {passwordMessage && <p role="status" className="text-sm text-green-700">{passwordMessage}</p>}
              <div className="pt-4 border-t flex justify-end">
                <button type="submit" disabled={savingPassword} className="px-6 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-full shadow-sm transition">
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen
          onClose={() => setIsEditProfileOpen(false)}
          profileData={profile}
          onSave={handleProfileSave}
        />
      )}
      {isEditBusinessOpen && (
        <EditBusinessModal
          isOpen
          onClose={() => setIsEditBusinessOpen(false)}
          businessData={business}
          onSave={handleBusinessSave}
        />
      )}
    </div>
  );
}

function Detail({ icon, label, value, wide = false }: { icon: ReactNode; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`${wide ? 'sm:col-span-2' : ''} bg-gray-100 p-2.5 border border-gray-200`}>
      <span className="text-gray-500 font-semibold flex items-center gap-1.5 text-xs uppercase mb-1">
        <span className="text-blue-900 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span> {label}
      </span>
      <p className="text-gray-900 font-medium text-base break-words">{value || 'Not provided'}</p>
    </div>
  );
}

function PasswordField({ label, value, onChange, minLength }: { label: string; value: string; onChange: (value: string) => void; minLength?: number }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={label === 'Current password' ? 'current-password' : 'new-password'}
        className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900"
        minLength={minLength}
        required
      />
    </label>
  );
}
