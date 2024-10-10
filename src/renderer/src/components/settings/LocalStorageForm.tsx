import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import MemoraConfig from 'src/types/MemoraConfig';
import api from '@types/api';
import handleSubmit from './functions/handleSubmit';
import handleInputChange from './functions/handleInputChange';

const LocalStorageForm: React.FC = () => {
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

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label>
          {<>Local storage directory:</> }
          <Input
            name="mediaDirectory"
            value={config.mediaDirectory}
            onChange={(evt) => handleInputChange(setConfig, evt.target.name, evt.target.value)}
          />
        </label>
      </div>

      <Button type="primary" onClick={() => handleSubmit(config)}>
        Save Config
      </Button>
    </div>
  );
};

export default LocalStorageForm;
