import { useEffect, useState } from 'react';
import { ShieldAlert, UserCheck, Eye, Building2, Mail, User } from 'lucide-react';
import type { AdminUserResponse, UserAccount } from '@/types/admin';
import AdminViewUserModal from '@/components/modals/AdminViewUserModal';
import Loading from '@/components/common/Loading';
import { mapAdminUser } from '@/lib/admin';
import { getApiErrorMessage } from '@/lib/errors';
import api from '@/lib/axios';
import { useToast } from '@/context/ToastContext';

export default function AdminBanned() {
  const { showToast } = useToast();
  const [bannedUsers, setBannedUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    let active = true;

    api().get<{ users: AdminUserResponse[] }>('/api/admin/banned-users')
      .then(({ data }) => {
        if (active) setBannedUsers(data.users.map(mapAdminUser));
      })
      .catch((error: unknown) => {
        if (active) {
          const message = getApiErrorMessage(error, 'Could not load banned accounts.');
          setErrorMessage(message);
          showToast('error', message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showToast]);

  const handleUnbanUser = async (user: UserAccount) => {
    if (!window.confirm(`Restore access for ${user.name}?`)) return;

    setBusyUserId(user.id);
    setErrorMessage('');
    try {
      await api().patch(`/api/admin/users/${user.id}/unban`);
      setBannedUsers((current) => current.filter((entry) => entry.id !== user.id));
      setSelectedUser(null);
      showToast('success', `${user.name}'s account access was restored.`);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not restore this account.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) return <Loading message="Loading banned accounts..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 text-white shadow-xl flex items-center gap-4">
        <div className="p-3 bg-red-900/50 border border-red-600 rounded-xl text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Banned Accounts</h1>
          <p className="text-sm text-gray-400 mt-1">Review suspended accounts or restore access.</p>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {bannedUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            No banned accounts at the moment.
          </div>
        ) : bannedUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-sm opacity-90" />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                  <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-200">Banned</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 font-medium">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-900" /> {user.email}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-orange-500" /> {user.businessName || 'No business'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
              <button
                onClick={() => setSelectedUser(user)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow transition"
              >
                <Eye className="w-4 h-4" /> View Details
              </button>
              <button
                onClick={() => void handleUnbanUser(user)}
                disabled={busyUserId === user.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow transition"
              >
                <UserCheck className="w-4 h-4" /> {busyUserId === user.id ? 'Restoring...' : 'Unban Account'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminViewUserModal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
}
