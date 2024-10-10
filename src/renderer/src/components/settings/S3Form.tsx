import React, { useState, useEffect } from 'react';
import { Input, Button, Switch, notification } from 'antd';
import MemoraConfig from 'src/types/MemoraConfig';
import api from '@types/api';
import handleSubmit from './functions/handleSubmit';
import handleInputChange from './functions/handleInputChange';
import TestResult from '@types/TestResult';

const S3Form: React.FC = () => {
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
    api.connectionTestS3(config).then((result: TestResult) => {
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
          Enable synchronization with S3 bucket<br />
          Ensure that webdav is disabled, otherwise weird things happen<br />
          <Switch
            checkedChildren="Online"
            unCheckedChildren="Offline"
            checked={config.s3Config?.s3Enabled}
            onChange={(evt) => handleInputChange(setConfig, "s3Enabled", evt)}
          />
        </label>
      </div>

      {config.s3Config?.s3Enabled && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Endpoint:
              <Input
                name="s3Endpoint"
                value={config.s3Config?.s3Endpoint || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Region:
              <Input
                name="s3Region"
                value={config.s3Config?.s3Region || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Access Key ID:
              <Input
                name="s3AccessKeyId"
                value={config.s3Config?.s3AccessKeyId || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Secret Access Key:
              <Input
                name="s3SecretAccessKey"
                value={config.s3Config?.s3SecretAccessKey || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
                type="password"
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              Force Path Style:
              <Switch
                checked={config.s3Config?.s3ForcePathStyle || false}
                onChange={(evt) => handleInputChange(setConfig, "s3ForcePathStyle", evt)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Bucket
              <Input
                name="s3Bucket"
                value={config.s3Config?.s3Bucket || ''}
                onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
              />
            </label>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>
              S3 Subdirectory
              <Input
                name="s3SubDirectory"
                value={config.s3Config?.s3SubDirectory || ''}
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
        {config.s3Config?.s3Enabled && (
        <Button type="dashed" onClick={() => testConnection(config)}>
          Test S3 connection
        </Button>
        )}
      </div>
    </div>
  );
};

export default S3Form;
