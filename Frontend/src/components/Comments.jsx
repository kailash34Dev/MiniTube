import { ThumbsUp, ThumbsDown } from 'lucide-react';
import thumbnail from '../assets/thumbnail.jpg';

export default function Comments() {
  const dummyComments = [
    {
      id: 1,
      author: "@frontend_master",
      time: "2 hours ago",
      text: "This tutorial is exactly what I was looking for! The CSS variable approach instead of Tailwind is very interesting and works perfectly for this project.",
      likes: 45
    },
    {
      id: 2,
      author: "@react_newbie_101",
      time: "5 hours ago",
      text: "Could you make a follow up video on how to connect this to a real backend API? Maybe Node.js or Firebase?",
      likes: 12
    },
    {
      id: 3,
      author: "@webdev_journey",
      time: "1 day ago",
      text: "The responsive grid layout is so smooth. Great job explaining CSS grid concepts simply.",
      likes: 89
    }
  ];

  return (
    <div className="comments-section">
      <h2 className="comments-header">245 Comments</h2>
      
      <div className="comment-input-row">
        <img src={thumbnail} alt="Your Avatar" className="channel-avatar-large" style={{ width: '40px', height: '40px' }} />
        <div className="comment-input-wrapper">
          <input type="text" placeholder="Add a comment..." className="comment-input" />
        </div>
      </div>

      <div className="comments-list">
        {dummyComments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <img src={thumbnail} alt={comment.author} className="channel-avatar-large" style={{ width: '40px', height: '40px' }} />
            <div className="comment-content">
              <div className="comment-author">
                {comment.author} <span className="comment-time">{comment.time}</span>
              </div>
              <div className="comment-text">
                {comment.text}
              </div>
              <div className="comment-actions">
                <button className="comment-action-btn">
                  <ThumbsUp size={14} />
                  {comment.likes}
                </button>
                <button className="comment-action-btn">
                  <ThumbsDown size={14} />
                </button>
                <button className="comment-action-btn" style={{ fontWeight: 600 }}>
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
