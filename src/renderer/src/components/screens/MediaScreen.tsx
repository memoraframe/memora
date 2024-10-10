import React, { useEffect, useState } from 'react';
import { Card, Row, Col, notification } from 'antd';
import api from '@types/api';
import MemoraConfig from '@types/MemoraConfig';
import { isDirectory } from '../isDirectory';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@renderer/routes';
import { ArrowUpOutlined, PictureOutlined, FolderOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { isVideo } from '../isVideo';

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
                            className='media-item'
                            hoverable
                            onClick={() => goUp()}
                            cover={
                                <div style={{ position: 'relative', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                        <ArrowUpOutlined
                                            style={{
                                                fontSize: 150,
                                                paddingTop: 50
                                            }}
                                        />
                                        .. (Go Up)
                                    </div>
                                </div>
                            }
                        >
                        </Card>
                    ) : (
                        <Card
                            className='media-item'
                            hoverable
                            onClick={() => close()}

                            cover={
                                <div style={{ position: 'relative', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                        <PictureOutlined
                                            style={{
                                                fontSize: 150,
                                                paddingTop: 50
                                            }}
                                        />
                                        Slideshow
                                    </div>
                                </div>
                            }
                        >
                        </Card>
                    )}
                </Col>

                {directories.map((directory, index) => (
                    <Col span={8} key={index} style={{ marginBottom: 16 }}>
                        <Card
                            className='media-item'
                            hoverable
                            onClick={() => handleDirectoryClick(directory)}
                            cover={
                                <div style={{ position: 'relative', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                        <FolderOutlined
                                            style={{
                                                fontSize: 150,
                                                paddingTop: 50
                                            }}
                                        />
                                        {directory.split('/').pop()}
                                    </div>
                                </div>
                            }
                        >
                        </Card>
                    </Col>
                ))}
                {imagePaths.map((item, index) => (
                    <Col span={8} key={index} style={{ marginBottom: 16 }}>
                        <Card
                            hoverable
                            className='media-item'
                            cover=
                            {isVideo(item) ? (
                                <div style={{ position: 'relative', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                        <VideoCameraOutlined
                                            style={{
                                                fontSize: 150,
                                                paddingTop: 50
                                            }}
                                        />
                                        {item.split('/').pop()}
                                    </div>
                                </div>
                            ) : (
                                <img
                                    alt={item}
                                    src={item}
                                />
                            )}

                        />
                    </Col>
                ))}

            </Row>
        </div>
    );
};

export default MediaScreen;
