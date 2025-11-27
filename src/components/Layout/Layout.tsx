import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { fetchRoles } from '../../store/thunks/rolesThunks.js';
import Header from './Header';

const Layout = () => {
  const dispatch = useAppDispatch();
  const { items: roles, loading: rolesLoading } = useAppSelector((state) => state.roles);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch roles on mount if not already loaded
  useEffect(() => {
    if (roles.length === 0 && !rolesLoading) {
      dispatch(fetchRoles());
    }
  }, [dispatch, roles.length, rolesLoading]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Horizontal Navigation */}
      <Header onMenuClick={toggleDrawer} isDrawerOpen={isDrawerOpen} onCloseDrawer={closeDrawer} />

      {/* Backdrop overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-24 sm:pt-28">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

