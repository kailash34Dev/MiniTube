import { Upload as UploadIcon, Video } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Upload() {
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    alert('Video uploaded successfully (Mock)!');
    window.location.href = '/dashboard';
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-content">
        <div className="upload-container">
          <h1 className="dashboard-header">Upload Video</h1>
          
          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleUploadSubmit}>
              
              <div className="upload-dropzone">
                <UploadIcon size={48} className="upload-icon" />
                <div className="upload-title">Drag and drop video files to upload</div>
                <div className="upload-subtitle">Your videos will be private until you publish them.</div>
                <button type="button" className="btn btn-primary">
                  Select Files
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Title (required)</label>
                <input type="text" className="form-input" placeholder="Add a title that describes your video" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Tell viewers about your video" />
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input type="url" className="form-input" placeholder="https://example.com/image.jpg" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary">
                  Publish Video
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
