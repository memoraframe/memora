import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
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
        navigate(ROUTES.HOME);
    };

    const goTo = (src: string) => {
        navigate(ROUTES.HOME + "?src=" + src);
    };
    
    const handleDirectoryClick = (directory: string) => {
        setCurrentDirectory(`${currentDirectory}/${directory}`);
    };

    function getThumbnailPath(item: string): string  {
        return item.replace("file://" + mediaDirectory, "thum://" + mediaDirectory + "/thumbnails");
    }

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
                            onClick={() => goTo(item)}
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
                                <ImageWithPlaceholder
                                    alt={item}
                                    src={getThumbnailPath(item)}
                                    />
                            )}

                        />
                    </Col>
                ))}

            </Row>
        </div>
    );
};

const placeholderImage = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjAiIHk9IjAiIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwLCAwLCA1MDAsIDUwMCI+CiAgPGcgaWQ9IkxheWVyXzEiPgogICAgPGc+CiAgICAgIDxwYXRoIGQ9Ik0yNzEuMjMxLDExNi4xOTcgQzI5MC40MzcsMTE2LjE5NyAzMDcuMDc4LDEyNi42NCAzMTYuMjY5LDE0Mi4wMyBMMzcwLjQwNywxNDIuMDkxIEwzNzAuNDA3LDExMy4wMjIgQzM3MC40MDcsMTAyLjI0MyAzNjEuNjQzLDkzLjQ4IDM1MC44MzQsOTMuNDggTDE0OC45Nyw5My40OCBDMTM4LjE5MSw5My40OCAxMjkuNDU5LDEwMi4yNDMgMTI5LjQ1OSwxMTMuMDIyIEwxMjkuNTIsMTQxLjg0NiBMMjI2LjE5MiwxNDEuOTA4IEMyMzUuNDQ0LDEyNi41NzkgMjUyLjAyNCwxMTYuMTk3IDI3MS4yMzEsMTE2LjE5NyIgZmlsbD0iI0NCQ0JDQiIvPgogICAgICA8cGF0aCBkPSJNMTgwLjA4NSw4NC4yNTggTDE2Mi4xMzEsODQuMjU4IEwxNjAuMDU0LDkwLjczMiBMMTgxLjU4MSw5MC43MzIgeiIgZmlsbD0iI0NCQ0JDQiIvPgogICAgICA8cGF0aCBkPSJNMzQyLjAxLDgwLjgwOCBMMzE4LjEwMSw4MC44MDggTDMxMy44NTcsOTAuNzkzIEwzNDUuODg4LDkwLjc5MyB6IiBmaWxsPSIjQ0JDQkNCIi8+CiAgICAgIDxwYXRoIGQ9Ik0yNzguODAzLDczLjM4OCBMMjIwLjcyNiw3My4zODggTDIwOC43NTcsOTAuOTE1IEwyODkuNzk2LDkwLjkxNSBMMjc4LjgwMyw3My4zODggeiBNMjU5LjkzMyw4Ny4zNDIgTDIzOS4zMjIsODcuMzQyIEwyMzkuMzIyLDc3LjM4OCBMMjU5LjkzMyw3Ny4zODggTDI1OS45MzMsODcuMzQyIHoiIGZpbGw9IiNDQkNCQ0IiLz4KICAgICAgPHBhdGggZD0iTTMxOS4wNDgsMTQ3LjIyMSBDMzIyLjA0LDE1My44MTYgMzIzLjgxMSwxNjEuMDgzIDMyMy44MTEsMTY4LjgwOSBDMzIzLjgxMSwxOTcuODQ3IDMwMC4yNjksMjIxLjQyIDI3MS4yLDIyMS40MiBDMjQyLjEzMSwyMjEuNDIgMjE4LjU4OSwxOTcuODc3IDIxOC41ODksMTY4LjgwOSBDMjE4LjU4OSwxNjEuMDgzIDIyMC4zMjksMTUzLjgxNiAyMjMuMzUyLDE0Ny4xOSBMMTI5LjQyOCwxNDcuMTkgTDEyOS40MjgsMjI2LjQ1OCBDMTI5LjQyOCwyMzcuMjM3IDEzOC4xMywyNDYgMTQ4Ljk0LDI0NiBMMzUwLjgwNCwyNDYgQzM2MS42MTMsMjQ2IDM3MC4zNzYsMjM3LjIzNyAzNzAuMzc2LDIyNi40NTggTDM3MC40MzcsMTQ3LjIyMSBMMzE5LjA0OCwxNDcuMjIxIHoiIGZpbGw9IiNDQkNCQ0IiLz4KICAgICAgPHBhdGggZD0iTTI5OS45MDMsMTUxLjUyNiBDMjk5LjA3OCwxNTAuMDYgMjk4LjA0LDE0OC42ODYgMjk2LjkxLDE0Ny4zNzMgQzI5MC43NzMsMTM5Ljk4NCAyODEuNTgyLDEzNS4xNTkgMjcxLjIsMTM1LjE1OSBDMjYwLjgxOCwxMzUuMTU5IDI1MS42MjcsMTM5Ljk1MyAyNDUuNDksMTQ3LjMxMiBDMjQ0LjM2LDE0OC42NTYgMjQzLjM1MywxNTAuMDMgMjQyLjQzNiwxNTEuNTI2IEMyMzkuMzIyLDE1Ni41OTUgMjM3LjQ5LDE2Mi40NTcgMjM3LjQ5LDE2OC44MDkgQzIzNy40OSwxODcuMzc0IDI1Mi41NzQsMjAyLjQ1OCAyNzEuMiwyMDIuNDU4IEMyODkuNzM1LDIwMi40NTggMzA0Ljg0OSwxODcuNDA0IDMwNC44NDksMTY4LjgwOSBDMzA0Ljg0OSwxNjIuNDU3IDMwMy4wMTcsMTU2LjU5NSAyOTkuOTAzLDE1MS41MjYiIGZpbGw9IiNDQkNCQ0IiLz4KICAgIDwvZz4KICAgIDx0ZXh0IHRyYW5zZm9ybT0ibWF0cml4KDEsIDAsIDAsIDEsIDI1NCwgMzQ5KSI+CiAgICAgIDx0c3BhbiB4PSItMTczLjcyNyIgeT0iLTE0LjgxMiIgZm9udC1mYW1pbHk9IlNhdGh1IiBmb250LXNpemU9IjcyIiBmaWxsPSIjREREREREIj5JbWFnZSBOb3Q8L3RzcGFuPgogICAgICA8dHNwYW4geD0iLTE3NS40IiB5PSI4MC41ODgiIGZvbnQtZmFtaWx5PSJTYXRodSIgZm9udC1zaXplPSI3MiIgZmlsbD0iI0RERERERCI+R2VuZXJhdGVkPC90c3Bhbj4KICAgIDwvdGV4dD4KICA8L2c+Cjwvc3ZnPgoK";

const ImageWithPlaceholder = ({ src, alt }) => {
    return (
      <img 
      className='media-item'
        src={src} 
        alt={alt} 

        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }} 
      />
    );
  };
export default MediaScreen;
