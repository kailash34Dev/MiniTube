import { useState } from 'react';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import VideoDetails from '../components/VideoDetails';
import Comments from '../components/Comments';
import RecommendedVideos from '../components/RecommendedVideos';
import Sidebar from '../components/Sidebar';

export default function Video() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // By default collapsed on video page? Or maybe we can just overlay it.
  
  // For simplicity, we can keep the navbar and overlay the sidebar or hide it entirely
  // YouTube normally uses a drawer sidebar for the video page.
  // We will just not render the sidebar here or use the collapsed one if needed, 
  // but based on design, we just need Navbar.

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="video-page-layout">
      <Navbar toggleSidebar={toggleSidebar} />
      {/* We can hide sidebar for video page to focus on video, or render it based on state */}
      {!isSidebarCollapsed && (
        <div style={{ position: 'absolute', top: '64px', bottom: 0, zIndex: 40 }}>
           <Sidebar isCollapsed={false} />
        </div>
      )}
      
      <div className="video-page-content">
        <main className="video-main">
          <VideoPlayer />
          <VideoDetails />
          <Comments />
        </main>
        
        <aside className="video-sidebar">
          <RecommendedVideos />
        </aside>
      </div>
    </div>
  );
}
