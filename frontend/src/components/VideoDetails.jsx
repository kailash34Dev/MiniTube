import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share, Download, MoreHorizontal } from 'lucide-react';

export default function VideoDetails({ video }) {
  const [likeCount, setLikeCount] = useState(video?.likeCount || 0);
  const [dislikeCount, setDislikeCount] = useState(video?.dislikeCount || 0);
  const [userAction, setUserAction] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubsLoading, setIsSubsLoading] = useState(false);

  useEffect(() => {
    if (!video) return;
    
    setLikeCount(video.likeCount || 0);
    setDislikeCount(video.dislikeCount || 0);

    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://localhost:5003/api/interactions/${video.id}/status`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUserAction(data.action);
        }
      } catch (error) {
        console.error("Error fetching interaction status:", error);
      }
    };
    
    const fetchSubscriptionData = async () => {
      if (!video.channelId) return;
      try {
        const profileRes = await fetch(`http://localhost:3003/api/subscriptions/${video.channelId}/profile`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSubscriberCount(profileData.channel.subscriberCount || 0);
        }
        
        const subRes = await fetch(`http://localhost:3003/api/subscriptions/${video.channelId}/status`, {
          credentials: 'include'
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setIsSubscribed(subData.isSubscribed);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      }
    };

    fetchStatus();
    fetchSubscriptionData();
  }, [video]);

  const handleInteraction = async (type) => {
    try {
      const response = await fetch(`http://localhost:5003/api/interactions/${video.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserAction(data.action);
        setLikeCount(data.likeCount);
        setDislikeCount(data.dislikeCount);
      } else if (response.status === 401) {
        alert("Please log in to like or dislike videos.");
      }
    } catch (error) {
      console.error("Error toggling interaction:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!video || !video.channelId || isSubsLoading) return;
    setIsSubsLoading(true);
    try {
      const response = await fetch(`http://localhost:3003/api/subscriptions/${video.channelId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.action === "subscribed");
        setSubscriberCount(data.subscriberCount);
      } else if (response.status === 401) {
        alert("Please log in to subscribe to channels.");
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    } finally {
      setIsSubsLoading(false);
    }
  };

  if (!video) return null;

  // Format views
  const formatViews = (views) => {
    if (views === undefined || views === null) return "0 views";
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M views";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K views";
    return views + " views";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="video-header">
      <h1 className="video-title-large">{video.title}</h1>
      
      <div className="video-actions-row">
        <div className="channel-info">
          <img src={video.channelAvatar || 'https://via.placeholder.com/40'} alt={video.channelName} className="channel-avatar-large" />
          <div className="channel-text">
            <span className="channel-name">{video.channelName}</span>
            <span className="channel-subs">{formatViews(subscriberCount)} subscribers</span>
          </div>
          <button 
            className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
            onClick={handleSubscribe}
            disabled={isSubsLoading}
            style={{
              backgroundColor: isSubscribed ? '#272727' : '#f1f1f1',
              color: isSubscribed ? '#f1f1f1' : '#0f0f0f',
            }}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        <div className="video-action-buttons">
          <div className="action-btn-group">
            <button 
              className={`action-btn ${userAction === 'like' ? 'active' : ''}`}
              onClick={() => handleInteraction('like')}
              style={{ color: userAction === 'like' ? '#3ea6ff' : 'inherit' }}
            >
              <ThumbsUp size={18} fill={userAction === 'like' ? '#3ea6ff' : 'none'} />
              {likeCount > 0 ? formatViews(likeCount).replace(' views', '') : 'Like'}
            </button>
            <div className="action-divider"></div>
            <button 
              className={`action-btn ${userAction === 'dislike' ? 'active' : ''}`}
              onClick={() => handleInteraction('dislike')}
              style={{ color: userAction === 'dislike' ? '#3ea6ff' : 'inherit' }}
            >
              <ThumbsDown size={18} fill={userAction === 'dislike' ? '#3ea6ff' : 'none'} />
              {dislikeCount > 0 ? formatViews(dislikeCount).replace(' views', '') : 'Dislike'}
            </button>
          </div>
        </div>
      </div>

      <div className="video-description-box">
        <div className="desc-meta">
          {formatViews(video.views)} • {formatDate(video.created_at)}
        </div>
        <div className="desc-text" style={{ whiteSpace: 'pre-line' }}>
          {video.description}
        </div>
      </div>
    </div>
  );
}
