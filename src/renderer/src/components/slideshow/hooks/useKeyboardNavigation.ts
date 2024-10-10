import { useEffect } from 'react';

const useKeyboardNavigation = (nextSlide: () => void, prevSlide: () => void) => {
    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                nextSlide();
            } else if (event.key === 'ArrowLeft') {
                prevSlide();
            }
        };

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [nextSlide, prevSlide]);
};

export default useKeyboardNavigation;
