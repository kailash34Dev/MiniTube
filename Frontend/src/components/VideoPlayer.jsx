import thumbnail from '../assets/thumbnail.jpg';

export default function VideoPlayer() {
  return (
    <div className="video-player-wrapper">
      {/* For now, we will use the thumbnail as a poster for a placeholder video tag */}
      <video 
        className="video-player" 
        controls 
        poster={thumbnail}
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        Your browser does not support HTML video.
      </video>
    </div>
  );
}
