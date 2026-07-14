import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function RecommendedVideos() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const STREAMING_URL = import.meta.env.VITE_STREAMING_SERVICE_URL || 'http://localhost:5002';
        const response = await fetch(`${STREAMING_URL}/api/videos/${id}/recommendations`);
        
        if (response.ok) {
          const data = await response.json();
          setVideos(data.recommendations || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [id]);

  return (
    <div className="recommended-list">
      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>Loading recommendations...</div>
      ) : videos.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>No recommendations found.</div>
      ) : (
        videos.map((video) => (
          <Link to={`/video/${video.id}`} key={video.id} className="compact-video-card">
            <div className="compact-thumbnail-container">
              <img src={video.thumbnail_path} alt={video.title} className="video-thumbnail" loading="lazy" />
              {video.duration && (
                <div className="video-duration">{Math.floor(video.duration / 60)}:{(Math.floor(video.duration % 60)).toString().padStart(2, '0')}</div>
              )}
            </div>
            <div className="compact-info">
              <h3 className="compact-title">{video.title}</h3>
              <div className="compact-meta">
                <div className="compact-meta-item">{video.channelName}</div>
                <div className="compact-meta-item">
                  {video.views} views • {new Date(video.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
