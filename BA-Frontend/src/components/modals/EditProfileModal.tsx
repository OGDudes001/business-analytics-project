import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Camera } from 'lucide-react';
import type { ProfileData } from '@/types/profile';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (updated: ProfileData, image: File | null) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, profileData, onSave }: EditProfileModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(profileData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profileData.profileImageUrl);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await onSave(formData, imageFile);
      showToast('success', 'Profile updated successfully.');
      onClose();
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not save your profile.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-profile-title" className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl p-6 text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 id="edit-profile-title" className="text-xl font-bold text-blue-900">Edit Profile Details</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-gray-900"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm bg-gray-100 flex items-center justify-center">
              {previewUrl ? <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-500" />}
            </div>
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition">
              <Camera className="w-4 h-4" /> Change Profile Image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreviewUrl(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setPreviewUrl(profileData.profileImageUrl);
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Name
            <input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Email
            <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
            <input type="tel" value={formData.phoneNumber} onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={30} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Birthday
            <input type="date" value={formData.birthday} onChange={(event) => setFormData({ ...formData, birthday: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Home Address
            <input type="text" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>

          {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 rounded-lg text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white rounded-lg text-sm font-semibold">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
