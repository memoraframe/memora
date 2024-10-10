import { useRef } from 'react';
import { isImage } from '../isImage';
import { PlayCircleOutlined } from '@ant-design/icons';

type ThumbnailCarouselProps = {
  images: string[];
  selectedMedia: (mediaSrc: string) => void;
};
const ThumbnailCarousel: React.FC<ThumbnailCarouselProps> = ({ images, selectedMedia }) => {
  const carouselRef = useRef<HTMLDivElement>(null); 
  
  return (
    <div
      className="thumbnail-carousel"
    >
      <div
        className="thumbnail-carousel-inner"
        ref={carouselRef}
      >
        {images.map((image, index) => (
          <div className="thumbnail" key={index}
          onClick={() => selectedMedia(image)}
          >
            { isImage(image) ?
              <img src={image} alt={`Thumbnail ${index}`} />
              : 
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PlayCircleOutlined style={{ fontSize: 30 }} />
              </div>
            }
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailCarousel;
