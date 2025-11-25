import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

