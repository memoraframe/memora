import React from 'react';
import { Card, Tabs, TabsProps } from 'antd';
import S3Form from '../settings/S3Form';
import WebdavForm from './WebdavForm';
import LocalStorageForm from './LocalStorageForm';

const StorageConfigurationScreen: React.FC = () => {
    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Local Storage',
          children: <LocalStorageForm />,
        },
        {
          key: '2',
          label: 'S3 Storage',
          children: <S3Form />,
        },
        {
          key: '3',
          label: 'Webdav',
          children: <WebdavForm />,
        }
    ]
    return (
        <>
        <Card style={{marginTop: 20}}>
            <Tabs 
                defaultActiveKey="1" 
                items={items} 
                />
        </Card>
    </>
    )
}

export default StorageConfigurationScreen;
