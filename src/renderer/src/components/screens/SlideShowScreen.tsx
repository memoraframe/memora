import { useEffect, useState } from 'react';
import { notification } from "antd";
import SlideShow from '../slideshow/SlideShow';
import api from '@types/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@renderer/routes';
import { error } from 'electron-log';
import MemoraConfig, { Transformation } from '@types/MemoraConfig';
import LoadingScreen from './LoadingScreen';
import _ from 'lodash';
import EmptySlideShow from './EmptySlideShow';

function SlideShowScreen(): JSX.Element {
    const navigate = useNavigate();

    const location = useLocation();
  
    // Using URLSearchParams to parse the query string
    const queryParams = new URLSearchParams(location.search);
    const selectedImage = queryParams.get('src'); // 'value'
    
    const [config, setConfig] = useState<MemoraConfig>();
    const [imagePaths, setImagePaths] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // UseEffect to load config
    useEffect(() => {
      api.getConfig().then((config: MemoraConfig) => {
        setConfig(config);
      });
    }, []);

    useEffect(() => {
        const fetchImagePaths = async () => {
            if (config && config.mediaDirectory) {
                try {
                    const paths = await api.getImages();
                    setImagePaths(_.shuffle(paths));
                } catch (e) {
                    notification.error({
                        message: 'Fetching media failed',
                        description: 'Configuration is not correct, could not read media directory',
                    });
                    error("Could not fetch images:" + e);
                    navigate(ROUTES.SETTINGS);
                }
            }
        };
    
        fetchImagePaths();
    }, [config]);
    

    useEffect(() => {
        if(!imagePaths) {
            return;
        }

        setIsLoading(false);
    }, [imagePaths]);

    if (isLoading || imagePaths == null) {
        return <LoadingScreen />;
    }
    if (imagePaths.length === 0 ) {
        return <EmptySlideShow />;
    }
    
    return (
        <SlideShow images={imagePaths} selectedImage={selectedImage} showSyncActivity={config?.showSyncActivity ?? false} showProgressBar={config?.showProgressBar ?? false} transformation={config?.transformation ?? Transformation.SLIDEX} />
    );
}

export default SlideShowScreen;
