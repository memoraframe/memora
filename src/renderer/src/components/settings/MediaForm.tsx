import React, { useState, useEffect } from 'react';
import { Button, Radio, Slider, Switch } from 'antd';
import MemoraConfig, { SyncActivityInformation, Transformation } from '@types/MemoraConfig';
import api from '@types/api';
import handleSubmit from './functions/handleSubmit';
import handleInputChange from './functions/handleInputChange';
import useTransformation from '../slideshow/hooks/useTransformation';
import { InfoCircleOutlined, LoadingOutlined, PoweroffOutlined } from '@ant-design/icons';

const MediaForm: React.FC = () => {
  const [config, setConfig] = useState<MemoraConfig>();
  const [loading, setLoading] = useState<boolean>(true);

  // UseEffect to load config
  useEffect(() => {
    api.getConfig().then((existingConfig: MemoraConfig) => {
      setLoading(false);
      setConfig(existingConfig);
    });
  }, []);

  const changeSyncInformation = (e: SyncActivityInformation) => {
    if (config?.showSyncActivity) {
      handleInputChange(setConfig, "showSyncActivity", e);
    }
  };
  const changeTransformation = (e: Transformation) => {
    if (config?.transformation) {
      handleInputChange(setConfig, "transformation", e);
    }
  };

  // Ensure config.transformation exists before destructuring
  let getTransformationIcon, getTransformations;
  if (config?.transformation) {
    ({ getTransformationIcon, getTransformations } = useTransformation(config.transformation));
  }
  const syncActivityInformations: SyncActivityInformation[] = [
    SyncActivityInformation.NONE,
    SyncActivityInformation.ICONONLY,
    SyncActivityInformation.DESCRIPTIVE
  ];


  const getIconForSyncActivity = (activity: SyncActivityInformation): React.ReactNode => {
    switch (activity) {
      case SyncActivityInformation.ICONONLY:
        return <>Icon</>;
      
      case SyncActivityInformation.DESCRIPTIVE:
        return <>Descriptive</>;
      
      case SyncActivityInformation.NONE:
      default:
        return <>Off</>;
    }
  };

  if (loading || !config) {
    return <></>
  }

  console.log(config);

  return (
    <div>

      <div style={{ marginBottom: '16px' }}>
        Slide transition type:<br />
        <Radio.Group buttonStyle='solid' value={config.transformation} onChange={(e) => changeTransformation(e.target.value)}>
          {getTransformations().map((transformation) => (
            <Radio.Button key={transformation} value={transformation}>
              {getTransformationIcon(transformation)}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>
          Show synchrozation feedback:<br />

          <Radio.Group buttonStyle='solid' value={config.showSyncActivity} onChange={(e) => changeSyncInformation(e.target.value)}>
          {syncActivityInformations.map((syncInformation) => (
            <Radio.Button style={{
              fontSize: 24,
              paddingLeft: 20, paddingRight: 20}} 
              key={syncInformation} 
              value={syncInformation}
              >
              {getIconForSyncActivity(syncInformation)}
            </Radio.Button>
          ))}
        </Radio.Group>
        </label>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>
          Show progress bar {config?.showProgressBar}<br />
          <Switch
            checkedChildren="Show"
            unCheckedChildren="Hide"
            checked={config.showProgressBar}
            onChange={(evt) => handleInputChange(setConfig, "showProgressBar", evt)}
          />
        </label>
      </div>

      
      <div style={{ marginBottom: '16px' }}>
        <label>
          Slide duration (seconds): {config?.slideTimeout}
          <Slider
            min={5}
            max={300}
            value={config?.slideTimeout}
            onChange={(value) => handleInputChange(setConfig, "slideTimeout", value)}
          />
        </label>
      </div>
      <Button type="primary" onClick={() => handleSubmit(config)}>
        Save Config
      </Button>
    </div>
  );
};

export default MediaForm;
