import { error } from 'electron-log';
import React, { useState, useEffect } from 'react';
import EXIF from 'exif-js';

type ImageProps = {
  src: string;          // file:// path
  alt: string;
  onError: () => void;
  loadMedia: () => boolean;
};

const Image: React.FC<ImageProps> = ({ src, alt, onError, loadMedia }) => {
  const [loaded, setLoaded] = useState(false);
  const [transform, setTransform] = useState<string>(''); // CSS transform

  useEffect(() => {
    if (!loadMedia()) {
      setLoaded(false);
      return;
    }

    const img = document.createElement('img');
    img.src = src;

    img.onload = () => {
      setLoaded(true);

      // Read EXIF orientation
      try {
        EXIF.getData(img, function () {
          const orientation = EXIF.getTag(this, 'Orientation') || 1;
          let t = '';

          switch (orientation) {
            case 2: t = 'scaleX(-1)'; break; // horizontal flip
            case 3: t = 'rotate(180deg)'; break;
            case 4: t = 'scaleY(-1)'; break; // vertical flip
            case 5: t = 'rotate(90deg) scaleX(-1)'; break;
            case 6: t = 'rotate(90deg)'; break;
            case 7: t = 'rotate(-90deg) scaleX(-1)'; break;
            case 8: t = 'rotate(-90deg)'; break;
            default: t = '';
          }

          setTransform(t);
        });
      } catch (e) {
        console.warn('Failed to read EXIF', e);
      }
    };

    img.onerror = () => {
      error(`Could not load image: ${src}`);
      onError();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, loadMedia, onError]);

  if (!loaded) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="carousel-image"
      style={{
        transform,
        transformOrigin: 'center',
      }}
    />
  );
};

export default Image;
