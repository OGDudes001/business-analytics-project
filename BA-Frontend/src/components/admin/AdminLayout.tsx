import { Outlet } from 'react-router';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <AdminNavbar />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
    </div>
  );
}