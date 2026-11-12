import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Home, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X 
} from 'lucide-react';
import logo from '@/assets/logo.webp';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
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

  const handleLogout = () => {
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
          
          <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Business Analytics Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-blue-900">Business</span>{' '}
              <span className="text-orange-500">Analytics</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-gray-800">
            {isLoggedIn ? (
              <>
                <Link
                  to="/home"
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive('/home')
                      ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                      : 'hover:text-blue-900'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/profile"
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive('/profile')
                      ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                      : 'hover:text-blue-900'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-1 text-gray-800 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive('/')
                      ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                      : 'hover:text-blue-900'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/register"
                  className={`flex items-center gap-2 py-1 transition-colors ${
                    isActive('/register')
                      ? 'text-blue-900 border-b-2 border-blue-900 font-bold'
                      : 'hover:text-blue-900'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
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
          {isLoggedIn ? (
            <>
              <Link
                to="/home"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive('/home')
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive('/profile')
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive('/')
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  isActive('/register')
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}