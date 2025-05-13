import { useState, useRef, useEffect } from 'react';
import VideoTimeline from '../video-timeline';
import VideoActionsButtons from '../video-actions-buttons';
import './styles.css'; 
import VideoTrimBar from '../video-trim';

const VideoPlayer = () => {
  // state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(1); 

 // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleSeeking = () => {
      setLoading(true);
    };
    
    const handleSeeked = () => {
      setLoading(false);
    };
    
    const handleLoadedData = () => {
      setDuration(videoElement.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    // handlers for video events
    videoElement.addEventListener('seeking', handleSeeking);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    // cleanup handlers
    return () => {
      videoElement.removeEventListener('seeking', handleSeeking);
      videoElement.removeEventListener('seeked', handleSeeked);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [])


  useEffect(() => {
    // set the vloume of the video to the state volume
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  
  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    isPlaying ? videoElement.pause() : videoElement.play();
    setIsPlaying(prev => !prev);
  };
  
  const displayVideoTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
      
    const totalTimeMinutes = Math.floor(duration / 60);
    const totalTimeSeconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} / ${totalTimeMinutes}:${totalTimeSeconds < 10 ? '0' : ''}${totalTimeSeconds}`;
  };
  
  const onTogglePlay = (playing:boolean) => {
    setIsPlaying(playing);
  }
  
  const handleVolumeChange = (value: number) => {
    setVolume(value);
  }
  
  return (
    <div className='video-player-wrapper'>
    <div className="video-player-container">
      <h1 className='video-player-title'>EasyVideoTrim</h1>
      <div className="video-wrapper">
        <video 
          ref={videoRef}
          src={"/videos/BigBuckBunny.mp4"} // use a downloaded video from public folder for this project
          onClick={togglePlay}
          className="video-element"

          />
        <div className='video-footer-container'>
        <VideoActionsButtons isPlaying={isPlaying} onTogglePlay={togglePlay} loading={loading} volume={volume} onVolumeChange={handleVolumeChange} />
        <VideoTimeline videoElement={videoRef.current} />
        <p className='video-time-display'>{displayVideoTime(currentTime)}</p>
      </div>
        <VideoTrimBar onTogglePlay={onTogglePlay} videoElement={videoRef.current} isVideoPlaying={isPlaying} />
        </div>
      </div>
          </div>
  );
};

export default VideoPlayer;