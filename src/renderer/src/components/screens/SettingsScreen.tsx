import React from 'react';
import { Button, Card, Tabs, TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import { PictureOutlined } from '@ant-design/icons';
import MediaForm from '../settings/MediaForm';
import StorageConfigurationScreen from '../settings/StorageConfigurationScreen';

const SetingsScreen: React.FC = () => {
    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Media configuration',
          children: <MediaForm />,
        },
        {
          key: '2',
          label: 'Storage Configuration',
          children: <StorageConfigurationScreen />,
        },
    ]
    return (
        <div className='settingsscreen'>
            <Link to="/">
                <Button type="link" size="large">
                    <span>&lt; Back to Slideshow</span>
                    <PictureOutlined />
                </Button>
            </Link>

            <Card className='card'>
                <Tabs 
                    defaultActiveKey="1" 
                    items={items} 
                    />
            </Card>
    </div>
    )
}

export default SetingsScreen;
