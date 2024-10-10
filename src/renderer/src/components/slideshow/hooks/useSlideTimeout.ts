import api from '@types/api';
import MemoraConfig from '@types/MemoraConfig';
import { useEffect, useRef, useState } from 'react';

const useSlideTimeout = (nextSlide: () => void) => {
    const [slideTimeout, setSlideTimeout] = useState(10000);
    
    useEffect(() => {
        // Load the existing config when the component mounts
        api.getConfig().then((existingConfig: MemoraConfig) => {
          setSlideTimeout(existingConfig.slideTimeout * 1000);
        });
      }, []);
      
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(nextSlide, slideTimeout);

        return () => resetTimeout();
    }, [nextSlide]);

    return resetTimeout;
};

export default useSlideTimeout;