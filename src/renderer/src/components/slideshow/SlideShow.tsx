import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import useSlideTimeout from './hooks/useSlideTimeout';
import Media from './Media';
import { error } from 'electron-log';
import SlideShowTimer from './SlideShowTimer';
import useTransformation from './hooks/useTransformation';
import { Transformation } from '@types/MemoraConfig';
import { InformationDisplay } from './InformationDisplay';
import useSlideshowControls from './hooks/useSlideshowControls';
import { isVideo } from '../isVideo';


type SlideShowProps = {
    images: string[];
    showProgressBar: boolean;
    transformation: Transformation;
    selectedImage: string | null
};

const SlideShow: React.FC<SlideShowProps> = ({ images, showProgressBar, transformation, selectedImage }) => {
    // ensure errors are not here.
    if (images.length == 0) {
        return <></>
    }

    const isAnimating = useRef<boolean>(false);
    const visibleIndex = useRef<number>(1);

    const [currentIndex, setCurrentIndex] = useState(1);
    const [showInformation, setShowInformation] = useState(false);
    const [displayedImages, setDisplayedImages] = useState<string[]>([]);

    const resetTimeout = useSlideTimeout(() => nextSlide());
    const { getTransformation } = useTransformation(transformation);

    const props = useSpring({
        immediate: !isAnimating.current,
        transform: getTransformation(visibleIndex.current),
        config: { tension: 220, friction: 120, duration: 750 },
        onRest: () => {
            if (isAnimating.current) {
                isAnimating.current = false
                renderDisplayedImages();
            }
        },
    });

    useEffect(() => {
        if (images.length > 0) {
            if (selectedImage) {
                for (let i = 0; i < images.length; i++) {
                    if (images[i] === selectedImage) {
                        setCurrentIndex(i - 1)
                        const newImages = [
                            images[i - 1 % images.length],
                            images[(i) % images.length],
                            images[(i + 1) % images.length],
                        ];
                        setDisplayedImages(newImages);
                        visibleIndex.current = 1;
                    }
                }
            } else {
                renderDisplayedImages();
            }
        }
    }, []);

    const renderDisplayedImages = () => {
        const newImages = [
            images[currentIndex % images.length],
            images[(currentIndex + 1) % images.length],
            images[(currentIndex + 2) % images.length],
        ];
        setDisplayedImages(newImages);
        visibleIndex.current = 1;
    };

    const nextSlide = () => {
        if (images.length === 0 || isAnimating.current) return;
        isAnimating.current = true;
        visibleIndex.current = visibleIndex.current + 1;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        if (images.length === 0 || isAnimating.current) return;
        isAnimating.current = true;
        visibleIndex.current = visibleIndex.current - 1;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };


    // Restore slideshow to original state, and move forward.
    const errorHandler = () => {
        error("Error occured while loading media")
        isAnimating.current = false;
        renderDisplayedImages();
        nextSlide();
    };
    const handleVideoEnd = () => {
        nextSlide();
    };


    const handlers = useSlideshowControls({
        nextSlide,
        prevSlide,
        setShowInformation,
        showInformation,
    });

    function currentImage(): string {
        return images[currentIndex + 1];
    }

    return (
        <div className="slideshow">
            <InformationDisplay
                imageSrc={currentImage()}
                show={showInformation}
            />

            <div className="carousel-container" {...handlers}>
                <animated.div className="carousel-images"
                    style={{
                        ...props,
                        flexDirection: transformation === Transformation.SLIDEY ? "column" : "row",
                    }}
                >
                    {displayedImages.map((image, i) => (
                        <Media
                            key={i}
                            src={image}
                            alt={`Slide ${i}`}
                            loadMedia={() => i === 0 || i === 1 || i === 2}
                            onError={errorHandler}
                            onVideoEnd={handleVideoEnd}
                            onVideoPlay={() => {
                                // Stop the transition of 
                                resetTimeout();
                            }}
                            playVideo={() => {
                                return i === 1 && !isAnimating.current
                            }}
                        />
                    ))}
                </animated.div>
            </div>
            {showProgressBar ?
                <div style={{ position: 'absolute', bottom: '0', width: '100%' }}>
                    <SlideShowTimer showsVideo={isVideo(currentImage())} nextSlide={nextSlide} />
                </div>
                : <></>
            }
        </div>
    );
};

export default SlideShow;
