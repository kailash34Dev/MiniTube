import { Link } from 'react-router-dom';
import thumbnail from '../assets/thumbnail.jpg';

export default function RecommendedVideos() {
  const dummyVideos = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 10,
    title: i % 2 === 0 ? "React JS Crash Course for Beginners - 2026" : "Build a YouTube Clone with React & Tailwind CSS",
    thumbnail: thumbnail,
    duration: "1:01:38",
    channelName: "MiniTube Code",
    views: Math.floor(Math.random() * 900) + 10 + "K views",
    timestamp: "2 days ago"
  }));

  return (
    <div className="recommended-list">
      {dummyVideos.map((video) => (
        <Link to={`/video/${video.id}`} key={video.id} className="compact-video-card">
          <div className="compact-thumbnail-container">
            <img src={video.thumbnail} alt={video.title} className="video-thumbnail" loading="lazy" />
            <div className="video-duration">{video.duration}</div>
          </div>
          <div className="compact-info">
            <h3 className="compact-title">{video.title}</h3>
            <div className="compact-meta">
              <div className="compact-meta-item">{video.channelName}</div>
              <div className="compact-meta-item">
                {video.views} • {video.timestamp}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
