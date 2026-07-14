import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import thumbnail from '../assets/thumbnail.jpg';

export default function DashboardVideoList() {
  const [videos, setVideos] = useState([
    { id: 1, title: 'React JS Crash Course for Beginners - 2026', date: 'Jun 24, 2026', views: '113K', likes: '12K', thumbnail },
    { id: 2, title: 'Build a YouTube Clone with React & Tailwind CSS', date: 'Jun 20, 2026', views: '870K', likes: '45K', thumbnail },
    { id: 3, title: 'Understanding CSS Grid in 10 Minutes', date: 'Jun 15, 2026', views: '63K', likes: '5.2K', thumbnail },
  ]);

  const [editingVideo, setEditingVideo] = useState(null);

  const handleDelete = (id) => {
    // In a real app, this would call an API
    if (window.confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    // Dummy save
    const formData = new FormData(e.target);
    const title = formData.get('title');
    setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, title } : v));
    setEditingVideo(null);
  };

  return (
    <>
      <div className="dashboard-list-container">
        <div className="dashboard-list-header">
          <div>Video</div>
          <div>Date</div>
          <div>Views / Likes</div>
          <div>Actions</div>
        </div>
        
        {videos.map(video => (
          <div key={video.id} className="dashboard-list-row">
            <div className="dashboard-video-cell">
              <img src={video.thumbnail} alt={video.title} className="dashboard-thumbnail" />
              <div className="dashboard-video-info">
                <div className="dashboard-video-title">{video.title}</div>
              </div>
            </div>
            <div className="dashboard-video-date">{video.date}</div>
            <div>
              {video.views} / {video.likes}
            </div>
            <div className="dashboard-actions">
              <button 
                className="dashboard-action-btn" 
                onClick={() => setEditingVideo(video)}
                title="Edit Video"
              >
                <Edit2 size={18} />
              </button>
              <button 
                className="dashboard-action-btn danger" 
                onClick={() => handleDelete(video.id)}
                title="Delete Video"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No videos uploaded yet.
          </div>
        )}
      </div>

      {editingVideo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header">Edit Video</h2>
            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label className="form-label">Title (required)</label>
                <input name="title" type="text" className="form-input" defaultValue={editingVideo.title} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-textarea" defaultValue="This is a description." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingVideo(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
