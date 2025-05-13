import {  useRef } from "react";
import './styles.css';

interface Props {
  videoElement: HTMLVideoElement | null;
}

const VideoTimeline = ({ videoElement }: Props) => {
  // refs
  const wrapperRef = useRef<HTMLDivElement>(null);

  // get the width of the video that has been played
    const getVideoPlayedWidth = () => {
      if(!videoElement) return 0;
      const {currentTime, duration} = videoElement;
      return `${(currentTime / duration) * 100}%`;
    }

    // handle the drag down of the timeline
    const handleMouseDown = (downEvent: React.MouseEvent<HTMLDivElement>) => { // triggered when start to push on the mouse for dragging
      

      // when mouse is down and move, check if is inside boondry of the timeline and if yes set the current time to the percentage of the timeline
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!wrapperRef.current || !videoElement) return;
    
        const rect = wrapperRef.current.getBoundingClientRect();
        const relativeX = moveEvent.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
        videoElement.currentTime = percentage * videoElement.duration;
      };
    

      // remove the event listeners when mouse is up
      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      // add the event listeners when mouse is down
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };
    
    // handle click on the timeline and jump to the clicked position
    const handleTimelineClick = (clickEvent: React.MouseEvent<HTMLDivElement>) => {
      if (!wrapperRef.current || !videoElement) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const relativeX = clickEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      videoElement.currentTime = percentage * videoElement.duration;
    }

    if(!videoElement) return null;

  return (
  <div className="video-timeline-wrapper" ref={wrapperRef} onClick={handleTimelineClick}>
    <div className="video-timeline-progress" style={{width: getVideoPlayedWidth()}} >
      <div className="video-timeline-progress-dot" onMouseDown={handleMouseDown}/>
    </div>
  </div>
  )};

export default VideoTimeline;
