import React from 'react';
import { isImage } from '../isImage';
import { isVideo } from '../isVideo';
import Image from './Image';
import Video from './Video';

type MediaProps = {
    src: string;
    alt: string;
    loadMedia: () => boolean;
    onError: () => void;
    onVideoEnd: () => void;
    onVideoPlay: () => void;
    playVideo: () => boolean; // Optional function to control video playback externally
};

const Media: React.FC<MediaProps> = ({ src, alt, loadMedia, onError, onVideoEnd, onVideoPlay, playVideo }) => {
    if (isImage(src)) {
        return (
            <Image
                src={src}
                alt={alt}
                onError={onError}
                loadMedia={loadMedia}
            />
        );
    } else if (isVideo(src)) {
        return (
            <Video
                src={src}
                onError={onError}
                loadMedia={loadMedia}
                onVideoEnd={onVideoEnd}
                onVideoPlay={onVideoPlay}
                playVideo={playVideo}
            />
        );
    }

    return null; // Default return value if media type is not determined
};

export default Media;
