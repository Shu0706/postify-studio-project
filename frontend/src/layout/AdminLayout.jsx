import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import MobileSidebar from '../components/dashboard/MobileSidebar';
import RealtimeNotifications from '../components/common/RealtimeNotifications';

const AdminLayout = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar userRole="admin" />
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        userRole="admin" 
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          onMenuButtonClick={toggleSidebar} 
          user={currentUser}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      {/* Real-time Notifications */}
      <RealtimeNotifications />
    </div>
  );
};

export default AdminLayout;
