import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  return (
    <Link to={`/video/${video.id}`} className="video-card">
      <div className="video-thumbnail-container">
        <img src={video.thumbnail} alt={video.title} className="video-thumbnail" loading="lazy" />
        <div className="video-duration">{video.duration}</div>
      </div>
      <div className="video-info">
        <img src={video.channelAvatar} alt={video.channelName} className="channel-avatar" loading="lazy" />
        <div className="video-details">
          <h3 className="video-title">{video.title}</h3>
          <div className="video-meta">
            <div className="video-meta-item">{video.channelName}</div>
            <div className="video-meta-item">
              {video.views} • {video.timestamp}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
