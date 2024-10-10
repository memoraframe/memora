import React, { useState, useEffect } from 'react';
import { Button, Radio, Slider, Switch } from 'antd';
import MemoraConfig, { Transformation } from '@types/MemoraConfig';
import api from '@types/api';
import handleSubmit from './functions/handleSubmit';
import handleInputChange from './functions/handleInputChange';
import useTransformation from '../slideshow/hooks/useTransformation';

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


  if (loading || !config) {
    return <></>
  }

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
