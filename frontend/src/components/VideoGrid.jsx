import { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import thumbnail from '../assets/thumbnail.jpg';

// Helper to format duration in seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Helper to format created_at date to relative time (e.g. "2 days ago")
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

// Helper to format views (e.g. 1500 to 1.5K)
const formatViews = (views) => {
  if (views === undefined || views === null) return "0 views";
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M views";
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K views";
  }
  return views + " views";
};

export default function VideoGrid() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const STREAMING_URL = import.meta.env.VITE_STREAMING_SERVICE_URL || 'http://localhost:5002';
        const response = await fetch(`${STREAMING_URL}/api/videos`);
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        
        // Map the backend response to the format VideoCard expects
        const mappedVideos = data.videos.map((v) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail_path,
          duration: formatDuration(v.duration),
          channelName: v.channelName || "Unknown Creator",
          channelAvatar: v.channelAvatar || thumbnail, // fallback to dummy thumbnail
          views: formatViews(v.views),
          timestamp: formatTimeAgo(v.created_at)
        }));
        
        setVideos(mappedVideos);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="content-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>No videos found. Be the first to upload one!</p>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="video-grid">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
