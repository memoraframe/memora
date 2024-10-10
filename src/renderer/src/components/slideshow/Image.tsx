import { error } from 'electron-log';
import React, { useState, useEffect } from 'react';

type ImageProps = {
    src: string;
    alt: string;
    onError: () => void;
    loadMedia: () => boolean;
};

const Image: React.FC<ImageProps> = ({ src, alt, onError, loadMedia }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loadMedia()) {
            if (loaded) {
                setLoaded(false);
            }
            return;
        }

        const img = document.createElement('img');
        img.src = src;

        img.onload = () => {
            setLoaded(true);
        };

        img.onerror = () => {
            error("Could not load image: " + src);
            onError()
        };

        // Cleanup function to prevent memory leaks if the component unmounts
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, loadMedia]);

    return (
        <>
            {<img 
            src={loaded ? src : ''}
            alt={alt} className="carousel-image" />}
        </>
    );
};

export default Image;
