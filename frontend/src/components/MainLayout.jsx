import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout({ 
  children, 
  showSidebar = true, 
  defaultCollapsed = true,
  sidebarType = 'persistent' // 'persistent' (shows collapsed bar) or 'drawer' (completely hidden when collapsed)
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const shouldRenderSidebar = showSidebar && (sidebarType === 'persistent' || !isSidebarCollapsed);

  return (
    <div className="home-layout">
      <Navbar toggleSidebar={showSidebar ? toggleSidebar : undefined} />
      <div className="main-content">
        {shouldRenderSidebar && (
          <Sidebar isCollapsed={sidebarType === 'persistent' ? isSidebarCollapsed : false} />
        )}
        {children}
      </div>
    </div>
  );
}
