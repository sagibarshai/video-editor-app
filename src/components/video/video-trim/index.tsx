import { useEffect, useRef, useState } from "react";
import { AppIconPause, AppIconPlay } from "../../icons";
import Loading from "../../loading";
import "./styles.css";

interface Props {
    videoElement: HTMLVideoElement | null;
    onTogglePlay: (playing:boolean) => void;
    isVideoPlaying: boolean;
}

const VideoTrimBar = ({ videoElement, onTogglePlay,isVideoPlaying }: Props) => {
    const [snapshots, setSnapshots] = useState<{ time: number, imageUrl: string }[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<number>(-1);
    // trim times
    const [startTrim, setStartTrim] = useState<number>(0);
    const [endTrim, setEndTrim] = useState<number>(0);

    // previewing trim
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

    
    // refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const copyVideoRef = useRef<HTMLVideoElement>(null);
    const snapshotsBarRef = useRef<HTMLDivElement>(null);

    // trim lines
    const startLineRef = useRef<HTMLDivElement>(null);
    const endLineRef = useRef<HTMLDivElement>(null);

    // states for dragging
    const [draggingStart, setDraggingStart] = useState(false);
    const [draggingEnd, setDraggingEnd] = useState(false);



    // generate snapshots
    const generateTrimBarSnapshots = async () => {
        const canvas = canvasRef.current;
        const copy = copyVideoRef.current;
        if (!canvas || !copy) return;

        const { duration, videoWidth, videoHeight } = copy;
        const numberOfSnapshots = Math.min(Math.max(Math.floor(duration / 20), 5), 60); // min 5 max 100 calc based on 10 seconds per image
        const interval = duration / numberOfSnapshots; 

        canvas.width = videoWidth;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentSnapshots: { time: number, imageUrl: string }[] = [];

        for (let i = 0; i < numberOfSnapshots; i++) {
            const time = i * interval;

            await new Promise<void>((resolve) => {
                copy.onseeked = () => {
                    ctx.drawImage(copy, 0, 0, videoWidth, videoHeight);
                    const imageUrl = canvas.toDataURL("image/png");
                    currentSnapshots.push({ time, imageUrl });
                    copy.onseeked = null;
                    resolve();
                };
                copy.currentTime = time;
            });
        }

        setSnapshots(currentSnapshots);
    };

     // calculate the width of each snapshot
     const calcSnapshotWidth = () => {
        const gap = 2// defined gap = 2px in styles.css
        const bar = snapshotsBarRef.current;
        if (!bar) return;

        const width = bar.clientWidth - gap * (snapshots.length - 1);
        return `${width / snapshots.length}px`;
    }

    // handle dragging for start or end trim line
    const handleMouseDown = (e: React.MouseEvent, lineType: 'start' | 'end') => {
        if (lineType === 'start') {
            setDraggingStart(true);
        } else {
            setDraggingEnd(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!videoElement) return;
        if (draggingStart || draggingEnd) {
            const bar = snapshotsBarRef.current;
            if (!bar) return;
    
            const barWidth = bar.clientWidth;
            const offsetX = e.clientX - bar.getBoundingClientRect().left;
            const percent = Math.min(Math.max(offsetX / barWidth, 0), 1); // ensure it's between 0 and 1
    
            if (draggingStart) {
                const newStart = percent * videoElement.duration;
                if(newStart > endTrim) return
                setStartTrim(newStart);
            } else if (draggingEnd) {
                const newEnd = percent * videoElement.duration;
                if(newEnd < startTrim) return
                setEndTrim(newEnd);
            }
        }
    };

    const handleMouseUp = () => {
        setDraggingStart(false);
        setDraggingEnd(false);
    };


    const handleSnapshotClick = (index: number, time: number) => {
        if(!videoElement) return;
        setSelectedSnapshot(index);
        videoElement.currentTime = time;
    }

 

    const getSnapshotIndex = (time: number, totalSnapshots: number) => {
        if(!videoElement) return 0;
        const {duration} = videoElement;
        const index = Math.floor((time / duration) * totalSnapshots);
        return Math.min(index, totalSnapshots - 1);
    };
    
    const startIndex = getSnapshotIndex(startTrim, snapshots.length);
    const endIndex = getSnapshotIndex(endTrim, snapshots.length);


    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        if(!videoElement) return;
        if(videoElement.currentTime >= endTrim) {
            setIsPreviewPlaying(false);
            onTogglePlay(false)
        }
    }, [videoElement?.currentTime, isPreviewPlaying])


    useEffect(() => {
        if (!videoElement || !copyVideoRef.current) return;
        setEndTrim(videoElement.duration); // set the end trim to the video duration
        const copy = copyVideoRef.current;
        copy.src = videoElement.currentSrc || videoElement.src;
        copy.load(); // load the video

        copy.onloadedmetadata = () => {
            generateTrimBarSnapshots();
        };
    }, [videoElement]);

 // Set up event listeners for dragging
 useEffect(() => {
    if (!startLineRef.current || !endLineRef.current) return;

    const startLine = startLineRef.current;
    const endLine = endLineRef.current;


    startLine.onmousemove = (e: MouseEvent) => handleMouseMove(e as unknown as React.MouseEvent);
    endLine.onmousemove = (e: MouseEvent) => handleMouseMove(e as unknown as React.MouseEvent);

    startLine.onmouseup = () => handleMouseUp();
    endLine.onmouseup = () => handleMouseUp();

    return () => {
        // clean up event listeners
        startLine.onmousemove = null;
        endLine.onmousemove = null;
        startLine.onmouseup = null;
        endLine.onmouseup = null;
    };
}, [draggingStart, draggingEnd]);


    useEffect(() => {
        // toggle the play state of the video when preview is playing
        onTogglePlay(isPreviewPlaying);
    },[isPreviewPlaying])

    const handlePreviewToggle = () => {
        if(!videoElement) return;
        setIsPreviewPlaying(!isPreviewPlaying);
        if(!isPreviewPlaying) {
                videoElement.currentTime = startTrim;
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    useEffect(() => {
        if (!videoElement) return;       
        videoElement.ontimeupdate = () => {
            if (videoElement.currentTime >= endTrim) {
                videoElement.pause();
                setIsPreviewPlaying(false);
            }
        }
    
        if (isPreviewPlaying) {
            videoElement.currentTime = startTrim; 
            videoElement.play();
        } else {
            videoElement.pause();
        }
    
        return () => {
            videoElement.ontimeupdate = null
        };
    }, [isPreviewPlaying, startTrim, endTrim, videoElement])

    if (!videoElement) return null;
    
    return (
        <div className="trim-bar-container">
            <button className="preview-button" onClick={handlePreviewToggle}>
            {isPreviewPlaying ? (
                <>
                   {isVideoPlaying ? (
                    <>
                        Stop Preview <AppIconPause />
                    </>
                   ) : (
                    <>
                        Preview Trim <AppIconPlay />
                    </>
                   )}
                </>
                ) : (
                <>
                    Preview Trim <AppIconPlay />
                </>
                )}
            </button>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <video
                ref={copyVideoRef}
                style={{ display: 'none' }}
                muted
            />
            <div ref={snapshotsBarRef} className="snapshots-bar" onMouseMove={handleMouseMove}>
                {snapshots.length ? snapshots.map((s, index) => (
                    <img
                        onClick={() => handleSnapshotClick(index, s.time)}
                        width={calcSnapshotWidth()}
                        key={s.time}
                        src={s.imageUrl}
                        alt={`snapshot-${s.time}`}
                        className="snapshot-img"
                        style={{opacity:index >= startIndex && index <= endIndex ? 1 : 0.2, outline:selectedSnapshot === index ? '2px solid #fff' : 'none'}}
                    />
                )): <div className="loading-container">
                    <Loading color="#FF0000" size={30} />
                 </div>}
                 <div
                    className="trim-highlight"
                    style={{
                    left: `${(startTrim / videoElement.duration) * 100}%`,
                    width: `${((endTrim - startTrim) / videoElement.duration) * 100}%`,
                    }}
                />
                    <div
                    ref={startLineRef}
                    className="trim-line start"
                    style={{ left: `${startTrim / videoElement.duration * 100}%` }}
                    onMouseDown={(e) => handleMouseDown(e, 'start')}
                />
                <div
                    ref={endLineRef}
                    className="trim-line end"
                    style={{   left: `${Math.min((endTrim / videoElement.duration) * 100, 99)}%`
                }}
                    onMouseDown={(e) => handleMouseDown(e, 'end')}
                />
            </div>
            <div className="trim-info">
            <span>Start: {formatTime(startTrim)}</span>
            <span>Total: {formatTime(endTrim - startTrim)}</span>
            <span>End: {formatTime(endTrim)}</span>
        </div>
        </div>
    );
};

export default VideoTrimBar;