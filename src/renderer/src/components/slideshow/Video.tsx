import { error } from 'electron-log';
import React, { useRef, useEffect } from 'react';

type VideoProps = {
    src: string;
    onError: () => void;
    onVideoEnd: () => void;
    onVideoPlay: () => void;
    loadMedia: () => boolean;
    playVideo: () => boolean;
};

const Video: React.FC<VideoProps> = ({ src, onError, onVideoEnd, onVideoPlay, loadMedia, playVideo }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (videoRef.current && playVideo()) {
            videoRef.current.play();
        }
    }, [playVideo]);

    const registerError = () => {
        error("Could not load video: " + src);
        onError();
    }

    return (
        <video
            ref={videoRef}
            src={loadMedia() ? src : undefined}
            onEnded={onVideoEnd}
            onPlay={onVideoPlay}
            onError={registerError}
            muted
            className='carousel-video'
        />
    );
};

export default Video;
