import api from '@types/api';
import MemoraConfig from '@types/MemoraConfig';
import { Flex, Progress } from 'antd';
import React, { useState, useEffect, useRef } from 'react';

type ImageProps = {
    nextSlide: () => void,
    showsVideo: boolean
};

const SlideShowTimer: React.FC<ImageProps> = ({ nextSlide, showsVideo }) => {  
    const [slideTimeout, setSlideTimeout] = useState(10000);
    const [slideInterval, setSlideInterval] = useState(0); 
    const intervalDuration = 1000; 
    const intervalCountRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Load the existing config when the component mounts
        api.getConfig().then((existingConfig: MemoraConfig) => {
            setSlideTimeout(existingConfig.slideTimeout * 1000);
        });
    }, []);

    const resetTimeout = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalCountRef.current = 0;
        setSlideInterval(0);
    };

    const startTimer = () => {
        if (!showsVideo) {
            intervalRef.current = setInterval(() => {
                intervalCountRef.current += intervalDuration;

                // Calculate percentage of time elapsed
                const percentageElapsed = Math.min(
                    (intervalCountRef.current / slideTimeout) * 100,
                    100
                );
                
                // Update slide interval state as percentage
                setSlideInterval(percentageElapsed);

                // Check if the slide timeout has been reached
                if (intervalCountRef.current >= slideTimeout) {
                    resetTimeout(); // Reset after slide change
                }
            }, intervalDuration);
        }
    }

    useEffect(() => {
        // When the nextslide is called, restart the timer here.
        resetTimeout();
        startTimer();

        return () => {
            // Cleanup on component unmount
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [nextSlide]);

    if(showsVideo) {
        return <></>
    }
    
    return (
        <Flex gap="small" vertical>
            <Progress percent={slideInterval} type="line" showInfo={false} />
        </Flex>
    );
};

export default SlideShowTimer;
