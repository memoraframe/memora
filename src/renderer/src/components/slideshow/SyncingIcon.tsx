import React, { useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import api from '@types/api';

interface SyncingIconProps {
  size?: number; // Optional size prop to customize the icon size
}

const SyncingIcon: React.FC<SyncingIconProps> = ({ size = 48 }) => {
    const [showSyncInformation, setShowSyncInformation] = useState(false);

    api.onSyncStart(() => {
        setShowSyncInformation(true);
    });

    api.onSyncStop(() => {
        setShowSyncInformation(false);
    });

    api.onSyncError(() => {
        setShowSyncInformation(false);
    });

    if(!showSyncInformation) {
        return <></>
    }

  return (
    <div className="syncing-icon">
        <Spin indicator={<LoadingOutlined style={{ fontSize: size }} spin />} />
    </div>
  );
};

export default SyncingIcon;
