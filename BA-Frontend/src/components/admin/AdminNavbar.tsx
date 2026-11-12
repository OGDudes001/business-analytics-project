import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  UserX, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleAdminLogout = () => {
    setIsMobileMenuOpen(false);
    void logout()
      .then(() => {
        showToast('success', 'You have been signed out.');
        navigate('/', { replace: true });
      })
      .catch((error: unknown) => {
        console.error('Logout request failed; local session was cleared.', error);
        showToast('error', 'You were signed out locally, but the server could not revoke this session.');
        navigate('/', { replace: true });
      });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Business Analytics Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-blue-900">Business</span>{' '}
                <span className="text-orange-500">Analytics</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-gray-800">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-2 py-1 transition-colors ${
                isActive('/admin/dashboard')
                  ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/banned"
              className={`flex items-center gap-2 py-1 transition-colors ${
                isActive('/admin/banned')
                  ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              <UserX className="w-5 h-5" />
              <span>Banned Accounts</span>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-2 py-1 text-gray-800 hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2 font-medium">
          <Link
            to="/admin/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive('/admin/dashboard')
                ? 'bg-blue-50 text-blue-900 font-bold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/banned"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md ${
              isActive('/admin/banned')
                ? 'bg-blue-50 text-blue-900 font-bold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserX className="w-5 h-5" />
            <span>Banned Accounts</span>
          </Link>

          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}