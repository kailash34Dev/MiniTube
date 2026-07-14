import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, ChevronRight, ChevronLeft, Check, Gauge, SlidersHorizontal
} from 'lucide-react';

// Format time in seconds to MM:SS
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || !timeInSeconds) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({ streamUrl, poster }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const menuRef = useRef(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Settings Menu state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState('main'); // 'main', 'speed', 'quality'
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // -1 is auto

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Extract available qualities
        if (data.levels && data.levels.length > 0) {
          setQualities(data.levels.map((level, index) => ({
            index,
            height: level.height,
            bitrate: level.bitrate
          })).sort((a, b) => b.height - a.height)); // Sort highest to lowest
        }

        // Attempt Auto-play
        video.play().catch(e => {
          console.log("Auto-play with sound prevented, attempting muted auto-play", e);
          video.muted = true;
          video.play().catch(e => console.error("Muted auto-play also prevented", e));
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        if (hls.autoLevelEnabled) {
          // If auto, we could show what it's currently at, but let's keep it simple
        }
      });
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Video Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Controls auto-hide logic
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying && !isSettingsOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isHovering && !isSettingsOpen) setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isHovering, isSettingsOpen]);

  const handleMouseLeave = () => {
    if (isPlaying && !isSettingsOpen) setShowControls(false);
  };

  useEffect(() => {
    if (!isPlaying) setShowControls(true);
  }, [isPlaying]);

  // Click outside settings menu to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSettingsOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        // Also don't close if they clicked the settings button itself (handled in toggle)
        if (!e.target.closest('.settings-toggle-btn')) {
          setIsSettingsOpen(false);
          setSettingsView('main');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  // Player Actions
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    videoRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRef.current.muted = newMutedState;
    if (newMutedState) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume > 0 ? volume : 1;
      setVolume(volume > 0 ? volume : 1);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      await document.exitFullscreen();
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
    setSettingsView('main');
    setIsSettingsOpen(false);
  };

  const changeQuality = (levelIndex) => {
    setSelectedQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setSettingsView('main');
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && (isHovering || document.activeElement === videoRef.current)) {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'KeyF') toggleFullscreen();
      if (e.code === 'KeyM') toggleMute();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovering]);

  const timelineProgress = duration ? (currentTime / duration) * 100 : 0;
  const currentVolume = isMuted ? 0 : volume;

  const currentQualityText = selectedQuality === -1 ? 'Auto' : 
    (qualities.find(q => q.index === selectedQuality)?.height + 'p' || 'Auto');

  return (
    <div 
      ref={containerRef}
      className={`video-player-container ${(!showControls && isPlaying) ? 'hide-cursor' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video 
        ref={videoRef}
        className="video-player-element" 
        poster={poster}
        autoPlay
        onClick={() => {
          if (isSettingsOpen) {
            setIsSettingsOpen(false);
            setSettingsView('main');
          } else {
            togglePlay();
          }
        }}
      >
        Your browser does not support HTML video.
      </video>

      {/* Settings Menu Popup */}
      <div 
        ref={menuRef}
        className={`video-settings-menu ${isSettingsOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {settingsView === 'main' && (
          <>
            <div className="settings-menu-item" onClick={() => setSettingsView('speed')}>
              <div className="settings-menu-item-left">
                <Gauge size={16} />
                <span>Playback speed</span>
              </div>
              <div className="settings-menu-item-right">
                <span>{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                <ChevronRight size={16} />
              </div>
            </div>
            
            {qualities.length > 0 && (
              <div className="settings-menu-item" onClick={() => setSettingsView('quality')}>
                <div className="settings-menu-item-left">
                  <SlidersHorizontal size={16} />
                  <span>Quality</span>
                </div>
                <div className="settings-menu-item-right">
                  <span>{currentQualityText}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            )}
          </>
        )}

        {settingsView === 'speed' && (
          <>
            <div className="settings-menu-header" onClick={() => setSettingsView('main')}>
              <ChevronLeft size={18} />
              <span>Playback speed</span>
            </div>
            {SPEED_OPTIONS.map(speed => (
              <div 
                key={speed} 
                className={`settings-menu-item ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => changeSpeed(speed)}
              >
                <div className="settings-menu-item-left">
                  <div className="settings-check-icon">
                    {playbackSpeed === speed && <Check size={16} />}
                  </div>
                  <span>{speed === 1 ? 'Normal' : speed}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {settingsView === 'quality' && (
          <>
            <div className="settings-menu-header" onClick={() => setSettingsView('main')}>
              <ChevronLeft size={18} />
              <span>Quality</span>
            </div>
            <div 
              className={`settings-menu-item ${selectedQuality === -1 ? 'active' : ''}`}
              onClick={() => changeQuality(-1)}
            >
              <div className="settings-menu-item-left">
                <div className="settings-check-icon">
                  {selectedQuality === -1 && <Check size={16} />}
                </div>
                <span>Auto</span>
              </div>
            </div>
            {qualities.map(q => (
              <div 
                key={q.index} 
                className={`settings-menu-item ${selectedQuality === q.index ? 'active' : ''}`}
                onClick={() => changeQuality(q.index)}
              >
                <div className="settings-menu-item-left">
                  <div className="settings-check-icon">
                    {selectedQuality === q.index && <Check size={16} />}
                  </div>
                  <span>{q.height}p</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Custom Controls Overlay */}
      <div 
        className={`video-controls-overlay ${(showControls || !isPlaying || isSettingsOpen) ? 'visible' : ''}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="video-timeline-container">
          <div className="video-timeline-progress" style={{ width: `${timelineProgress}%` }} />
          <div className="video-timeline-thumb" style={{ left: `${timelineProgress}%` }} />
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="video-timeline-input"
          />
        </div>

        <div className="video-controls-bottom">
          <div className="video-controls-left">
            <button className="video-control-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            
            <div className="video-volume-container">
              <button className="video-control-btn" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <div className="video-volume-slider-wrapper">
                <div className="video-volume-progress" style={{ width: `${currentVolume * 100}%` }} />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={currentVolume} 
                  onChange={handleVolumeChange}
                  className="video-volume-input"
                />
              </div>
            </div>

            <div className="video-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="video-controls-right">
            <button 
              className="video-control-btn settings-toggle-btn" 
              onClick={() => {
                if (!isSettingsOpen) setSettingsView('main');
                setIsSettingsOpen(!isSettingsOpen);
              }}
            >
              <Settings size={20} />
            </button>
            <button className="video-control-btn" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
