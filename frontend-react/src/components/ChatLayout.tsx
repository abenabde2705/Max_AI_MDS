import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { ChatProvider } from '@/context/ChatContext';

export default function ChatLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <ChatProvider>
      <div className="max-chat">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Outlet context={{ toggleSidebar: () => setSidebarOpen(prev => !prev) }} />
      </div>
    </ChatProvider>
  );
}
