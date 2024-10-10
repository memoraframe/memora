import React, { useState, useEffect } from 'react';
import { Input, Button, Switch, notification } from 'antd';
import MemoraConfig from 'src/types/MemoraConfig';
import api from '@types/api';
import handleSubmit from './functions/handleSubmit';
import handleInputChange from './functions/handleInputChange';
import TestResult from '@types/TestResult';

const WebdavForm: React.FC = () => {
  const [config, setConfig] = useState<MemoraConfig>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getConfig().then((existingConfig: MemoraConfig) => {
      setLoading(false);
      setConfig(existingConfig);
    });
  }, []);

  if(loading || !config) {
    return <></>
  }
  
  function testConnection(config: MemoraConfig): void {
    api.connectionTestWebdav(config).then((result: TestResult) => {
      if(result.statusCode == 200) {
        notification.success({
          message: 'Success',
          description: 'Connection succeeded',
        });
      }else {
        notification.error({
          message: 'Connection Failed',
          description: result.message,
        });
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label>
          Enable synchronization with Webdav<br />
          Ensure that S3 sync is disabled, otherwise weird things happen<br />
          <Switch
            checkedChildren="Online"
            unCheckedChildren="Offline"
            checked={config.webdavConfig.webdavEnabled}
            onChange={(evt) => handleInputChange(setConfig, "webdavEnabled", evt)}
          />
        </label>
      </div>

      {config.webdavConfig.webdavEnabled && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label>
                Endpoint:
              <Input
                name="webdavEndpoint"
                value={config.webdavConfig.webdavEndpoint || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>
              Username
              <Input
                name="webdavUsername"
                value={config.webdavConfig.webdavUsername || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              Password
              <Input
                name="webdavPassword"
                value={config.webdavConfig.webdavPassword || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
                type="password"
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              Webdav Subdirectory
              <Input
                name="webdavSubDirectory"
                value={config.webdavConfig.webdavSubDirectory || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" onClick={() => handleSubmit(config)}>
          Save Config
        </Button>
        {config.webdavConfig.webdavEnabled && (
        <Button type="dashed" onClick={() => testConnection(config)}>
          Test Webdav connection
        </Button>
        )}
      </div>
    </div>
  );
};

export default WebdavForm;
