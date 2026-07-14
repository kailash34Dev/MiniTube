import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import VideoPlayer from '../components/VideoPlayer';
import VideoDetails from '../components/VideoDetails';
import Comments from '../components/Comments';
import RecommendedVideos from '../components/RecommendedVideos';

export default function Video() {
  const { id } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const STREAMING_URL = import.meta.env.VITE_STREAMING_SERVICE_URL || 'http://localhost:5002';
        const response = await fetch(`${STREAMING_URL}/api/videos/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const data = await response.json();
        setStreamUrl(data.streamUrl);
        setVideoData(data.video);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVideoDetails();
    }
  }, [id]);

  return (
    <MainLayout showSidebar={true} defaultCollapsed={true} sidebarType="drawer">
      <div className="video-page-content">
        <main className="video-main">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>Loading video...</div>
          ) : error ? (
            <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>
          ) : (
            <>
              <VideoPlayer streamUrl={streamUrl} poster={videoData?.thumbnail} />
              <VideoDetails video={videoData} />
            </>
          )}
          <Comments videoId={id} />
        </main>
        
        <aside className="video-sidebar">
          <RecommendedVideos />
        </aside>
      </div>
    </MainLayout>
  );
}
