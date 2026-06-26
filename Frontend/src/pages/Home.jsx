import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoGrid from '../components/VideoGrid';

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="home-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        {/* The user requested to remove the Category tags/badges for now */}
        <VideoGrid />
      </div>
    </div>
  );
}
