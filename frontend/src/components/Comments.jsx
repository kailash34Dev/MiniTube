import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import thumbnail from '../assets/thumbnail.jpg';

export default function Comments({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    if (!videoId) return;
    try {
      const response = await fetch(`http://localhost:5004/api/comments/${videoId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    if (!user) {
        alert("Please log in to comment.");
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5004/api/comments/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newCommentText }),
        credentials: 'include'
      });
      if (response.ok) {
        setNewCommentText("");
        fetchComments();
      } else if (response.status === 401) {
          alert("Please log in to comment.");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!user) {
        alert("Please log in to reply.");
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5004/api/comments/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText, parentCommentId }),
        credentials: 'include'
      });
      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      } else if (response.status === 401) {
          alert("Please log in to reply.");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  return (
    <div className="comments-section">
      <h2 className="comments-header">{comments.length} Comments</h2>
      
      <div className="comment-input-row">
        <img src={user?.profilePicture || thumbnail} alt="Your Avatar" className="channel-avatar-large" style={{ width: '40px', height: '40px' }} />
        <div className="comment-input-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="comment-input" 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          {newCommentText.trim() && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setNewCommentText("")}
                style={{ padding: '8px 16px', borderRadius: '18px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}>
                Cancel
              </button>
              <button 
                onClick={handleAddComment}
                disabled={isLoading}
                style={{ padding: '8px 16px', borderRadius: '18px', border: 'none', cursor: 'pointer', backgroundColor: '#3ea6ff', color: '#0f0f0f', fontWeight: '500' }}>
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', width: '100%' }}>
              <img src={comment.authorId?.profilePicture || thumbnail} alt={comment.authorId?.displayName} className="channel-avatar-large" style={{ width: '40px', height: '40px' }} />
              <div className="comment-content">
                <div className="comment-author">
                  {comment.authorId?.displayName} <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <div className="comment-text">
                  {comment.text}
                </div>
                <div className="comment-actions">
                  <button className="comment-action-btn">
                    <ThumbsUp size={14} />
                  </button>
                  <button className="comment-action-btn">
                    <ThumbsDown size={14} />
                  </button>
                  <button 
                    className="comment-action-btn" 
                    style={{ fontWeight: 600 }}
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Reply Input */}
            {replyingTo === comment._id && (
              <div className="comment-input-row" style={{ marginLeft: '52px', marginTop: '16px', width: 'calc(100% - 52px)' }}>
                <img src={user?.profilePicture || thumbnail} alt="Your Avatar" className="channel-avatar-large" style={{ width: '24px', height: '24px' }} />
                <div className="comment-input-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Add a reply..." 
                    className="comment-input" 
                    style={{ fontSize: '14px' }}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      style={{ padding: '6px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '13px' }}>
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleAddReply(comment._id)}
                      disabled={isLoading || !replyText.trim()}
                      style={{ padding: '6px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer', backgroundColor: '#3ea6ff', color: '#0f0f0f', fontWeight: '500', fontSize: '13px' }}>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies-list" style={{ marginLeft: '52px', marginTop: '12px', width: 'calc(100% - 52px)' }}>
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="comment-item" style={{ marginTop: '12px', paddingBottom: 0 }}>
                    <img src={reply.authorId?.profilePicture || thumbnail} alt={reply.authorId?.displayName} className="channel-avatar-large" style={{ width: '24px', height: '24px' }} />
                    <div className="comment-content">
                      <div className="comment-author" style={{ fontSize: '13px' }}>
                        {reply.authorId?.displayName} <span className="comment-time">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <div className="comment-text" style={{ fontSize: '14px' }}>
                        {reply.text}
                      </div>
                      <div className="comment-actions">
                        <button className="comment-action-btn">
                          <ThumbsUp size={12} />
                        </button>
                        <button className="comment-action-btn">
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
