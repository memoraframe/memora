import React, { useState } from 'react';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import api from '@types/api';

interface SyncingIconProps {
  show: boolean;
  size?: number; 
}

const SyncingIcon: React.FC<SyncingIconProps> = ({ show, size = 48 }) => {
    const [showSyncInformation, setShowSyncInformation] = useState(false);

    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    api.onSyncStart(() => {
        setShowSyncInformation(true);
    });

    api.onSyncStop(() => {
        setShowSyncInformation(false);
    });

    api.onSyncDownloadStart((src: string) => {
      if(!showSyncInformation) {
        setShowSyncInformation(true);
      }
      setCurrentFile(src); // Set the filename
      setIsFadingOut(false); // Ensure it's visible during download
    });

    api.onSyncDownloadStop((src: string) => {
      setIsFadingOut(true); // Start fading out when download stops
    });

    api.onSyncError(() => {
        setShowSyncInformation(false);
    });

    if (!show || !showSyncInformation) {
        return <></>
    }

  return (
    <>
    <div className="syncing-icon">
        <Spin indicator={<LoadingOutlined style={{ fontSize: size }} spin />} />
    </div>
      {currentFile && <div className={`syncing-filename ${isFadingOut ? 'fade-out' : ''}`}><DownloadOutlined /> {currentFile}</div>}
    </>

  );
};

export default SyncingIcon;
