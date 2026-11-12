import { X, User, Building2, ShieldAlert } from 'lucide-react';
import type { UserAccount } from '@/types/admin';

interface AdminViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
}

export default function AdminViewUserModal({ isOpen, onClose, user }: AdminViewUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-2xl rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-orange-400">User Account Details</h3>
            {user.isBanned && (
              <span className="bg-red-900/80 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-600 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Banned
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Section 1: Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-orange-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-gray-700 pb-1">
              <User className="w-4 h-4" /> Personal Information
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-700">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-300" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Full Name:</span>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Email Address:</span>
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Phone Number:</span>
                  <span className="font-semibold">{user.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Birthday & Gender:</span>
                  <span className="font-semibold">{user.birthday} ({user.gender})</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 text-xs block">Home Address:</span>
                  <span className="font-semibold">{user.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Business Information */}
          <div>
            <h4 className="text-sm font-semibold text-orange-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-gray-700 pb-1">
              <Building2 className="w-4 h-4" /> Business Information
            </h4>

            <div className="space-y-3 bg-gray-900 p-4 rounded-xl border border-gray-700">
              {user.businessImage && (
                <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={user.businessImage}
                    alt={user.businessName ?? 'Business'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Business Name:</span>
                  <span className="font-bold text-orange-400 text-base">{user.businessName || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Business Type:</span>
                  <span className="font-semibold">{user.businessType || 'Not provided'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 text-xs block">Business Address:</span>
                  <span className="font-semibold">{user.businessAddress || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Close Button */}
        <div className="mt-6 flex justify-end border-t border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}