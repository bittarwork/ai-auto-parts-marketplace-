import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import Container from '../common/Container';
import Button from '../common/Button';
import ConfirmModal from '../common/ConfirmModal';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

/**
 * Main Header Component
 * Contains navigation, search, cart, theme toggle
 */
export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();
  const isLoggedIn = !!localStorage.getItem('token');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    authService.logout();
    setLogoutModalOpen(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const navigation = [
    { name: t('common:home'), href: '/' },
    { name: t('common:products'), href: '/products' },
    { name: t('common:categories'), href: '/categories' },
    { name: t('common:aboutUs'), href: '/about' },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CA</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('common:appName')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart Auto Parts
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Icon (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </Button>
            
            {/* Wishlist - visible for all, login required on page */}
            <Link
              to="/wishlist"
              className="hidden sm:flex relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg"
            >
              <HeartIcon className="w-5 h-5" />
              {isLoggedIn && wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg flex"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* User / Account */}
            {isLoggedIn ? (
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg"
                  title="My Account"
                >
                  <UserIcon className="w-5 h-5" />
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      My Orders
                    </Link>
                    <Link
                      to="/vehicles"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <TruckIcon className="w-4 h-4" />
                      My Vehicles
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg-secondary transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <HeartIcon className="w-4 h-4" />
                      Wishlist
                    </Link>
                    <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      {t('common:logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </Container>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-dark-border animate-slide-up">
          <Container>
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-dark-border space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      My Dashboard
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      My Orders
                    </Link>
                    <Link to="/vehicles" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      My Vehicles
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      Wishlist
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors"
                    >
                      {t('common:logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {t('common:login')}
                    </Link>
                    <Link to="/register" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {t('common:register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title={t('common:logoutConfirmTitle')}
        message={t('common:logoutConfirmMessage')}
        confirmLabel={t('common:logout')}
        cancelLabel={t('common:cancel')}
        variant="danger"
      />
    </header>
  );
}
