import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  Shield,
  Home,
  Briefcase,
  Users,
  MessageCircle
} from 'lucide-react';

const NewNavbar = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation items
  const navigation = [
    { name: 'HOME', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'SERVICES', href: '/services', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'ABOUT', href: '/about', icon: <Users className="w-4 h-4" /> },
    { name: 'CONTACT', href: '/contact', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'employee':
        return '/employee/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Check if link is active
  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-brutal border-b-4 border-black dark:border-white'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent magical-text-glow group-hover:scale-105 transition-transform">
              Postify Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                  isActiveLink(item.href)
                    ? 'bg-primary-500 text-white shadow-brutal-sm'
                    : 'text-black dark:text-white hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-500'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-glow"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-purple-500" />
              )}
            </button>

            {/* User Actions */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 hover:scale-105 hover:shadow-glow"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block">
                    {currentUser.firstName || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-black border-4 border-black dark:border-white rounded-2xl shadow-brutal p-2"
                    >
                      <div className="px-4 py-3 border-b-2 border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-bold text-black dark:text-white">
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {currentUser.email}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase">
                            <Shield className="w-3 h-3" />
                            {currentUser.role}
                          </span>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to={getDashboardUrl()}
                          className="flex items-center gap-3 px-4 py-2 text-black dark:text-white hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl transition-colors font-semibold"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Home className="w-4 h-4" />
                          Dashboard
                        </Link>
                        
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-black dark:text-white hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl transition-colors font-semibold"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-black dark:text-white font-bold hover:text-primary-500 transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/signup"
                  className="btn-brutal text-sm px-6 py-2"
                >
                  GET STARTED
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:scale-110 transition-all duration-300 ml-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-black dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-black dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white dark:bg-black border-t-4 border-black dark:border-white"
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                    isActiveLink(item.href)
                      ? 'bg-primary-500 text-white shadow-brutal-sm'
                      : 'text-black dark:text-white hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-500'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
              
              {!currentUser && (
                <div className="pt-4 border-t-2 border-neutral-200 dark:border-neutral-700 space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 text-black dark:text-white font-bold hover:text-primary-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    SIGN IN
                  </Link>
                  <Link
                    to="/signup"
                    className="block btn-brutal text-center text-sm px-6 py-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    GET STARTED
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NewNavbar;
