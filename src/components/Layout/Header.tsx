import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Home, Shield, X, ChevronDown, Bot, Briefcase, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Button from '../UI/Button.js';

interface HeaderProps {
  onMenuClick: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

import type { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  submenus?: { path: string; label: string }[];
}

const Header = ({ onMenuClick, isDrawerOpen, onCloseDrawer }: HeaderProps) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const submenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});


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
      path: '/scraper',
      icon: Bot,
      label: 'Scraper',
      submenus: [
        { path: '/scraper/scrape', label: 'Scrape Control' },
        { path: '/scraper/listings', label: 'Listings' },
        { path: '/scraper/agents', label: 'Agents' },
      ],
    },
    {
      path: '/professional-profiles',
      icon: Briefcase,
      label: 'Professional Profiles',
      submenus: [
        { path: '/professional-profiles/lawyers', label: 'Lawyers' },
        { path: '/professional-profiles/valuers', label: 'Valuers' },
      ],
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
    };

    if (openSubmenu) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openSubmenu]);


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
          {/* Horizontal Navigation Menu */}
          <nav className="px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50/80 via-indigo-50/30 to-purple-50/30 backdrop-blur-sm">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
              {/* Mobile Menu Button */}
              <Button
                onClick={onMenuClick}
                variant="ghost"
                size="sm"
                className="lg:hidden p-2.5 mr-2"
                aria-label="Toggle menu"
              >
                <Menu size={22} className="text-gray-700" />
              </Button>
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
                <div className="text-center">
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
