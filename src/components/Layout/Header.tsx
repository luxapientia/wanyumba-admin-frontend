import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Home, Shield, Settings, LogOut, Menu, X, ChevronDown, Mail, Phone, UserCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { fetchCurrentUser } from '../../store/thunks/userThunks.js';
import Button from '../UI/Button.js';

interface HeaderProps {
  onMenuClick: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

interface NavItem {
  path: string;
  icon: any;
  label: string;
  submenus?: { path: string; label: string }[];
}

const Header = ({ onMenuClick, isDrawerOpen, onCloseDrawer }: HeaderProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, loading: userLoading } = useAppSelector((state) => state.user);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const submenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Fetch user info on mount
  useEffect(() => {
    if (!user && !userLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, userLoading]);

  const navItems: NavItem[] = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
    },
    {
      path: '/users',
      icon: User,
      label: 'Users',
    },
    {
      path: '/properties',
      icon: Shield,
      label: 'Properties',
      submenus: [
        { path: '/properties/pending', label: 'Pending Approval' },
        { path: '/properties/all', label: 'All Properties' },
      ],
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isSubmenuActive = (submenuPath: string) => {
    return location.pathname === submenuPath;
  };

  const hasActiveSubmenu = (item: NavItem) => {
    if (!item.submenus) return false;
    return item.submenus.some(submenu => isSubmenuActive(submenu.path));
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenu(openSubmenu === path ? null : path);
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openSubmenu && !target.closest('.submenu-container')) {
        setOpenSubmenu(null);
      }
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    if (openSubmenu || userMenuOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openSubmenu, userMenuOpen]);

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Admin User';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email.split('@')[0];
  };

  // Get user role display
  const getUserRoleDisplay = () => {
    if (!user || !user.roles || user.roles.length === 0) return 'Administrator';
    const role = user.roles[0];
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get dropdown position
  const getDropdownPosition = (path: string) => {
    const trigger = submenuRefs.current[path];
    if (!trigger) return { top: 0, left: 0 };
    
    const rect = trigger.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-full mx-auto">
          {/* Top Bar - Logo and User Actions */}
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-gray-100 bg-white/95 backdrop-blur-md">
            {/* Left Side - Menu Button (Mobile) and Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                onClick={onMenuClick}
                variant="ghost"
                size="sm"
                className="lg:hidden p-2.5"
                aria-label="Toggle menu"
              >
                <Menu size={22} className="text-gray-700" />
              </Button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'linear',
                    }}
                  />
                  <Shield size={24} className="text-white relative z-10" />
                </motion.div>
                <div className="hidden sm:block">
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-lg font-bold bg-gradient-to-r from-gray-900 to-indigo-800 bg-clip-text text-transparent"
                  >
                    Wanyumba Admin
                  </motion.h1>
                  <p className="text-xs text-gray-500 font-medium">Administration Panel</p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2.5 rounded-xl hover:bg-indigo-50"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600" />
                  <motion.span
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full ring-2 ring-white shadow-lg"
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </Button>
              </motion.div>

              {/* User Profile Menu */}
              <div className="relative pl-3 border-l border-gray-200" ref={userMenuRef}>
                <motion.div
                  className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {userLoading ? 'Loading...' : getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{getUserRoleDisplay()}</p>
                  </div>
                  <motion.div
                    className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-indigo-100 shadow-md overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={getUserDisplayName()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: 'linear',
                          }}
                        />
                        <User size={18} className="text-white relative z-10" />
                      </>
                    )}
                  </motion.div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 hidden sm:block transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </motion.div>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={getUserDisplayName()}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <UserCircle size={24} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-xs text-indigo-100 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="p-3 space-y-1">
                        {user?.phone && (
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
                            <Phone size={16} className="text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
                          <Mail size={16} className="text-gray-400" />
                          <span className="truncate">{user?.email}</span>
                        </div>
                        {user?.roles && user.roles.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg">
                            <Shield size={16} className="text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <span
                                  key={role}
                                  className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Menu Actions */}
                      <div className="border-t border-gray-200 p-2">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={18} className="text-gray-400" />
                          <span>Settings</span>
                        </Link>
                        <Button
                          onClick={() => {
                            setUserMenuOpen(false);
                            // TODO: Implement logout
                          }}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-red-600 hover:bg-red-50"
                          leftIcon={<LogOut size={18} />}
                        >
                          Logout
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2.5 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 hidden sm:flex"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Horizontal Navigation Menu - Desktop */}
          <nav className="hidden lg:block px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50/80 via-indigo-50/30 to-purple-50/30 backdrop-blur-sm">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path) || hasActiveSubmenu(item);
                const isSubmenuOpen = openSubmenu === item.path;

                return (
                  <div
                    key={item.path}
                    className="relative submenu-container"
                    ref={(el) => {
                      if (item.submenus) {
                        submenuRefs.current[item.path] = el;
                      }
                    }}
                  >
                    {item.submenus ? (
                      <>
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSubmenu(item.path);
                          }}
                          className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-300 rounded-t-xl cursor-pointer ${
                            isActive
                              ? 'text-indigo-600'
                              : 'text-gray-600 hover:text-indigo-600'
                          }`}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-full shadow-lg shadow-indigo-500/50"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}

                          <motion.div
                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon size={18} className="flex-shrink-0" />
                          </motion.div>
                          <span className="whitespace-nowrap">{item.label}</span>

                          {/* Submenu Indicator */}
                          <motion.div
                            animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={16} className="ml-1" />
                          </motion.div>

                          {/* Active Background */}
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-t-xl -z-10"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}

                          {/* Hover effect */}
                          {!isActive && (
                            <motion.div
                              className="absolute inset-0 bg-indigo-50/50 rounded-t-xl -z-10 opacity-0 hover:opacity-100 transition-opacity duration-300"
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all duration-300 rounded-t-xl ${
                          isActive
                            ? 'text-indigo-600'
                            : 'text-gray-600 hover:text-indigo-600'
                        }`}
                      >
                        {/* Active Indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-full shadow-lg shadow-indigo-500/50"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}

                        <motion.div
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                        </motion.div>
                        <span className="whitespace-nowrap">{item.label}</span>

                        {/* Active Background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-t-xl -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        {/* Hover effect */}
                        {!isActive && (
                          <motion.div
                            className="absolute inset-0 bg-indigo-50/50 rounded-t-xl -z-10 opacity-0 hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Submenu Dropdown Portal - Rendered outside header to avoid overflow issues */}
      {typeof document !== 'undefined' && openSubmenu && (() => {
        const item = navItems.find(i => i.path === openSubmenu && i.submenus);
        if (!item || !item.submenus) return null;
        
        const position = getDropdownPosition(openSubmenu);
        
        return createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 w-56"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 10000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-2">
                {item.submenus.map((submenu) => {
                  const isSubActive = isSubmenuActive(submenu.path);
                  return (
                    <Link
                      key={submenu.path}
                      to={submenu.path}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isSubActive
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border-l-4 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                      }`}
                      onClick={() => setOpenSubmenu(null)}
                    >
                      <motion.div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSubActive ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        animate={{ scale: isSubActive ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span>{submenu.label}</span>
                      {isSubActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        );
      })()}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-screen w-80 sm:w-96 bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="relative flex flex-col border-b border-gray-200 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          repeatDelay: 1 
                        }}
                      >
                        <Shield size={28} className="text-white drop-shadow-lg" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold text-white drop-shadow-md">Wanyumba Admin</h2>
                        <p className="text-xs text-indigo-100 font-medium">Navigation Menu</p>
                      </div>
                    </div>
                    <Button
                      onClick={onCloseDrawer}
                      variant="ghost"
                      size="sm"
                      className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      aria-label="Close menu"
                    >
                      <X size={22} className="text-white" />
                    </Button>
                  </div>

                  {/* User Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center ring-2 ring-white/30 overflow-hidden"
                        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={getUserDisplayName()}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {userLoading ? 'Loading...' : getUserDisplayName()}
                        </p>
                        <p className="text-xs text-indigo-100 truncate">{getUserRoleDisplay()}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-gray-50/50">
                <div className="px-4 space-y-2">
                  <div className="px-2 mb-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Main Menu</p>
                  </div>
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.path) || hasActiveSubmenu(item);
                    const isSubmenuOpen = openSubmenu === item.path;

                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.08,
                          type: 'spring',
                          stiffness: 100,
                          damping: 15
                        }}
                      >
                        <div>
                          <div
                            onClick={() => item.submenus && toggleSubmenu(item.path)}
                            className={`group relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                              item.submenus ? 'cursor-pointer' : ''
                            } ${
                              isActive
                                ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 shadow-lg shadow-indigo-500/10'
                                : 'text-gray-700 hover:bg-gray-100/80'
                            }`}
                          >
                            {!item.submenus && (
                              <Link
                                to={item.path}
                                onClick={onCloseDrawer}
                                className="absolute inset-0"
                              />
                            )}

                            {/* Active Indicator Bar */}
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 rounded-r-full shadow-lg"
                                layoutId="mobileActiveIndicator"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              />
                            )}

                            {/* Icon Container */}
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                              whileTap={{ scale: 0.95 }}
                              className={`relative p-3 rounded-xl transition-all duration-300 ${
                                isActive
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                              }`}
                            >
                              <Icon size={22} className="relative z-10" />
                            </motion.div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <span className={`font-semibold text-base block ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                                {item.label}
                              </span>
                            </div>

                            {/* Submenu Toggle Icon */}
                            {item.submenus && (
                              <motion.div
                                animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400"
                              >
                                <ChevronDown size={20} />
                              </motion.div>
                            )}
                          </div>

                          {/* Submenu Items */}
                          {item.submenus && (
                            <AnimatePresence>
                              {isSubmenuOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 pr-2 py-2 space-y-1">
                                    {item.submenus.map((submenu, subIndex) => {
                                      const isSubActive = isSubmenuActive(submenu.path);
                                      return (
                                        <motion.div
                                          key={submenu.path}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: subIndex * 0.05 }}
                                        >
                                          <Link
                                            to={submenu.path}
                                            onClick={onCloseDrawer}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                              isSubActive
                                                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                                            }`}
                                          >
                                            <motion.div
                                              className={`w-1.5 h-1.5 rounded-full ${
                                                isSubActive ? 'bg-indigo-600' : 'bg-gray-300'
                                              }`}
                                              animate={{ scale: isSubActive ? [1, 1.2, 1] : 1 }}
                                              transition={{ duration: 0.3 }}
                                            />
                                            <span className="text-sm">{submenu.label}</span>
                                            {isSubActive && (
                                              <motion.div
                                                className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                              />
                                            )}
                                          </Link>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
                <Button
                  variant="danger"
                  size="lg"
                  fullWidth
                  className="bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 border border-red-200/50"
                  leftIcon={<LogOut size={20} />}
                >
                  Logout
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 font-medium">Version 1.0.0</p>
                  <p className="text-xs text-gray-400 mt-1">© 2024 Wanyumba</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
