import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import type { BusinessProfileData } from '@/types/profile';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

interface EditBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessData: BusinessProfileData;
  onSave: (updated: BusinessProfileData, image: File | null) => Promise<void>;
}

export default function EditBusinessModal({ isOpen, onClose, businessData, onSave }: EditBusinessModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(businessData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(businessData.businessImageUrl);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      await onSave(formData, imageFile);
      showToast('success', 'Business details updated successfully.');
      onClose();
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Could not save your business details.');
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-business-title" className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl p-6 text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 id="edit-business-title" className="text-xl font-bold text-blue-900">Edit Business Details</h3>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-gray-900"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Business Banner Image</label>
            <div className="w-full h-32 rounded-xl overflow-hidden border border-gray-300 relative shadow-inner bg-gray-100 flex items-center justify-center">
              {previewUrl ? <img src={previewUrl} alt="Business banner preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-500" />}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 transition">
              <ImageIcon className="w-4 h-4" /> Upload New Banner
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
                    setPreviewUrl(businessData.businessImageUrl);
                  }
                }}
                className="sr-only"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-gray-700">
            Business Name
            <input type="text" value={formData.businessName} onChange={(event) => setFormData({ ...formData, businessName: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Business Type
            <input type="text" value={formData.businessType} onChange={(event) => setFormData({ ...formData, businessType: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Business Address
            <input type="text" value={formData.businessAddress} onChange={(event) => setFormData({ ...formData, businessAddress: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" maxLength={255} required />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Business Started Date
            <input type="date" value={formData.dateStarted} onChange={(event) => setFormData({ ...formData, dateStarted: event.target.value })} className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-900" required />
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
