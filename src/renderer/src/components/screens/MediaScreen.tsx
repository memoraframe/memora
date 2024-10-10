import React, { useEffect, useState } from 'react';
import { Card, Row, Col, notification } from 'antd';
import api from '@types/api';
import MemoraConfig from '@types/MemoraConfig';
import { isDirectory } from '../isDirectory';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@renderer/routes';

const MediaScreen: React.FC<{}> = () => {
    const [currentDirectory, setCurrentDirectory] = useState<string>('');
    const [mediaDirectory, setMediaDirectory] = useState<string>('');
    const [images, setImages] = useState<string[]>([]);
    const navigate = useNavigate()

    const [imagePaths, setImagePaths] = useState<string[]>([]);
    const [directories, setDirectories] = useState<string[]>([]);

    useEffect(() => {
        const fetchDir = async () => {
            const config: MemoraConfig = await api.getConfig();
            setMediaDirectory(config.mediaDirectory);
            setCurrentDirectory("file://" + config.mediaDirectory);

            const paths = (await api.getImages());
            setImages(paths);
        };
        fetchDir();
    }, []);

    const isRoot = (): boolean => {
        if (!currentDirectory || !mediaDirectory) {
            return true;
        }

        return "file://" + mediaDirectory === currentDirectory;
    }

    useEffect(() => {
        const updateScreen = async () => {
            const filteredDirectories = images
                .filter(p => p.startsWith(currentDirectory))
                .map(p => p.replace(`${currentDirectory}/`, ''))
                .map(p => p.split('/')[0])
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter(p => isDirectory(p))

            setDirectories(filteredDirectories);

            const filteredImages = images
                .filter(p => p.startsWith(currentDirectory) &&
                    p.replace(currentDirectory, '').split('/').length === 2)
            setImagePaths(filteredImages)
        };

        updateScreen();
    }, [images, mediaDirectory, currentDirectory]);

    const goUp = () => {
        if (!isRoot()) {
            const parentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/'));

            if (parentDirectory.startsWith("file://" + mediaDirectory)) {
                setCurrentDirectory(parentDirectory);
            }
        }
    };
    const close = () => {
        console.log("BOINK")
        navigate(ROUTES.HOME);
    };

    const handleDirectoryClick = (directory: string) => {
        setCurrentDirectory(`${currentDirectory}/${directory}`);
    };

    return (
        <div className="mediascreen">
            <Row gutter={16}>

                <Col span={8} style={{ marginBottom: 16 }}>
                    {!isRoot() ? (
                        <Card
                            className='directory'
                            hoverable
                            onClick={() => goUp()}
                        >
                            <Card.Meta
                                title=".. (Go Up)"
                            />
                        </Card>
                    ) : (
                        <Card
                            className='directory'
                            hoverable
                            onClick={() => close()}
                        >
                            <Card.Meta
                                title="Slideshow"
                            />
                        </Card>
                    )}
                </Col>


                {directories.map((directory, index) => (
                    <Col span={8} key={index} style={{ marginBottom: 16 }}>
                        <Card
                            className='directory'
                            hoverable
                            onClick={() => handleDirectoryClick(directory)}
                        >
                            <Card.Meta
                                title={directory}
                            />
                        </Card>
                    </Col>
                ))}
                {imagePaths.map((item, index) => (
                    <Col span={8} key={index} style={{ marginBottom: 16 }}>
                        <Card
                            className='image'
                            hoverable
                            cover={<img alt={item} src={item} style={{ objectFit: 'cover', height: '100%' }} />}
                        >
                        </Card>
                    </Col>
                ))}

            </Row>
        </div>
    );
};

export default MediaScreen;
