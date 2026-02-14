import { Button } from "@/components/ui/button";
import { Camera, Maximize, Pause, Play, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
    streamUrl: string;
    isLive: boolean;
}

export function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [timestamp, setTimestamp] = useState(0);

    useEffect(() => {
        setTimestamp(Date.now());
    }, []);

    // Toggle play/pause by breaking the image source
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            setTimestamp(Date.now()); // Force refresh to restart stream
        }
    };

    const takeSnapshot = () => {
        if (!imgRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(imgRef.current, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `snapshot-${new Date().toISOString()}.jpg`;
            a.click();
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            imgRef.current?.parentElement?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video group border border-border">
            {/* Live Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isLive && isPlaying ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
                <span className="text-xs font-mono font-bold text-white">
                    {isLive ? "LIVE REC" : "OFFLINE"}
                </span>
            </div>

            {/* Video Feed */}
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                {isPlaying ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        ref={imgRef}
                        src={`${streamUrl}?t=${timestamp}`}
                        alt="Surveillance Feed"
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground space-y-2">
                        <Pause className="w-12 h-12" />
                        <span className="text-sm font-mono">FEED PAUSED</span>
                    </div>
                )}
            </div>

            {/* Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                <div className="flex space-x-2">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={togglePlay}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={takeSnapshot}>
                        <Camera className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex space-x-2">
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
                        <Maximize className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
