import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow.js';
import { useLocation } from 'react-router-dom';

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const getCurrentPage = (): string => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/properties/pending')) return 'pending-properties';
    if (path.includes('/properties/all')) return 'all-properties';
    if (path.includes('/properties/')) return 'property-detail';
    if (path.includes('/users/')) return 'user-detail';
    if (path.includes('/users')) return 'users';
    if (path.includes('/scraper')) return 'scraper';
    return 'unknown';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="Open AI Butler"
        title="AI Butler - Get Help"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        role="admin"
        funnelStage="managing"
        currentPage={getCurrentPage()}
      />
    </>
  );
};

