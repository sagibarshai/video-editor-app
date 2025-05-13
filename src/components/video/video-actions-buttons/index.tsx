import { AppIconPause, AppIconPlay, AppIconVolumeMute, AppIconVolumeUp } from "../../icons";
import Loading from "../../loading";
import './styles.css';

interface Props {
    isPlaying: boolean;
    onTogglePlay: () => void;
    loading: boolean;
    volume: number;
    onVolumeChange: (value: number) => void;
}


const VideoActionsButtons = ({isPlaying, onTogglePlay, loading, volume, onVolumeChange}: Props) => {

  const toggleVolume = () => {
    onVolumeChange(volume === 0 ? 1 : 0);
  }
  
  return (
  <div className="video-actions-container">

  <button className="video-actions-button" onClick={onTogglePlay}>
    {loading ? <Loading /> : isPlaying ? <AppIconPause color="white" /> : <AppIconPlay color="white" />}
  </button>

  <div className="volume-container">
   { volume === 0 ? <AppIconVolumeMute onClick={toggleVolume} color="white" /> : <AppIconVolumeUp onClick={toggleVolume} color="white" />}
  <input
    type="range"
    min="0"
    max="1"
    step="0.01"
    value={volume}
    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
    className="volume-slider"
    />
    </div>
</div>
)}

export default VideoActionsButtons;