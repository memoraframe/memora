import React from 'react';
import { Alert } from 'antd';
import { Link } from 'react-router-dom'; // or use 'next/link' if you're using Next.js
import { ROUTES } from '@renderer/routes';

const EmptySlideShow: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '20px' }}>
    <Alert
      message="No media available"
      description={
        <span>
          The slideshow is empty because there is no media synchronized yet.<br />
          Please check back later, or{' '}
          <Link to={ROUTES.SETTINGS}>Click here to setup synchronization</Link>.
        </span>
      }
      type="info"
      showIcon
    />
  </div>
);

export default EmptySlideShow;
