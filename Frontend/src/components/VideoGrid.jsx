import VideoCard from './VideoCard';
import thumbnail from '../assets/thumbnail.jpg'; // Using dummy thumbnail as requested

export default function VideoGrid() {
  // Generate dummy data
  const dummyVideos = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    title: i % 2 === 0 ? "React JS Crash Course for Beginners - 2026" : "Build a YouTube Clone with React & Tailwind CSS",
    thumbnail: thumbnail,
    duration: "1:01:38",
    channelName: "MiniTube Code",
    channelAvatar: thumbnail, // Reusing thumbnail for avatar for simplicity
    views: Math.floor(Math.random() * 900) + 10 + "K views",
    timestamp: "2 days ago"
  }));

  return (
    <div className="content-area">
      <div className="video-grid">
        {dummyVideos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
