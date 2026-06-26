import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-react';
import thumbnail from '../assets/thumbnail.jpg';

export default function VideoDetails() {
  return (
    <div className="video-header">
      <h1 className="video-title-large">Build a YouTube Clone with React & Tailwind CSS</h1>
      
      <div className="video-actions-row">
        <div className="channel-info">
          <img src={thumbnail} alt="MiniTube Code" className="channel-avatar-large" />
          <div className="channel-text">
            <span className="channel-name">MiniTube Code</span>
            <span className="channel-subs">1.2M subscribers</span>
          </div>
          <button className="subscribe-btn">Subscribe</button>
        </div>

        <div className="video-action-buttons">
          <div className="action-btn-group">
            <button className="action-btn">
              <ThumbsUp size={18} />
              12K
            </button>
            <div className="action-divider"></div>
            <button className="action-btn">
              <ThumbsDown size={18} />
            </button>
          </div>
          
          <button className="action-btn">
            <Share size={18} />
            Share
          </button>
          
          <button className="action-btn">
            <Download size={18} />
            Download
          </button>

          <button className="action-btn" style={{ padding: '0 8px' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="video-description-box">
        <div className="desc-meta">
          870K views • 2 days ago
        </div>
        <div className="desc-text">
          In this video, we build a complete YouTube Clone using React, Vite, and custom CSS variables mimicking Tailwind structure. 
          
          We will cover:
          - Responsive layouts
          - Video grid
          - Dark theme support
          
          Don't forget to like and subscribe!
        </div>
      </div>
    </div>
  );
}
