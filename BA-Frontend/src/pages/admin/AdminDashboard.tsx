import { useEffect, useState } from 'react';
import { Search, Eye, UserX, Building2, Mail, User } from 'lucide-react';
import type { AdminUserResponse, UserAccount } from '@/types/admin';
import AdminViewUserModal from '@/components/modals/AdminViewUserModal';
import Loading from '@/components/common/Loading';
import { mapAdminUser } from '@/lib/admin';
import { getApiErrorMessage } from '@/lib/errors';
import api from '@/lib/axios';
import { useToast } from '@/context/ToastContext';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    let active = true;

    api().get<{ users: AdminUserResponse[] }>('/api/admin/users')
      .then(({ data }) => {
        if (active) setUsers(data.users.map(mapAdminUser));
      })
      .catch((error: unknown) => {
        if (active) {
          const message = getApiErrorMessage(error, 'Could not load user accounts.');
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

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(search)
      || user.email.toLowerCase().includes(search)
      || (user.businessName ?? '').toLowerCase().includes(search);
  });

  const handleBanUser = async (user: UserAccount) => {
    if (!window.confirm(`Ban ${user.name}'s account? They will be signed out immediately.`)) return;

    setBusyUserId(user.id);
    setErrorMessage('');
    try {
      await api().patch(`/api/admin/users/${user.id}/ban`);
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
      setSelectedUser(null);
      showToast('success', `${user.name}'s account was banned.`);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not ban this account.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setBusyUserId(null);
    }
  };

  if (loading) return <Loading message="Loading user accounts..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-2xl border border-gray-700 text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">User Management Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Review user accounts or suspend access.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, email, business..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            {users.length === 0 ? 'There are no active user accounts.' : 'No accounts match your search.'}
          </div>
        ) : filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-blue-900 shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-blue-900 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-900" />
                </div>
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
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
                onClick={() => void handleBanUser(user)}
                disabled={busyUserId === user.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow transition"
              >
                <UserX className="w-4 h-4" /> {busyUserId === user.id ? 'Banning...' : 'Ban Account'}
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
