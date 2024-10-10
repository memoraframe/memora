import api from "@types/api";
import MemoraConfig from "@types/MemoraConfig";
import { notification } from "antd";

const handleSubmit = (config: MemoraConfig) => {
    // Simple validation
    if (!config.mediaDirectory) {
      alert('Please enter the media directory');
      return;
    }

    if (config.s3Config?.s3Enabled) {
      const { s3Endpoint, s3Region, s3AccessKeyId, s3SecretAccessKey } = config.s3Config!;
      if (!s3Endpoint || !s3Region || !s3AccessKeyId || !s3SecretAccessKey) {
        alert('Please complete all S3 configuration fields');
        return;
      }
    }


    if (config.webdavConfig.webdavEnabled) {
      const { webdavEndpoint, webdavPassword, webdavUsername } = config.webdavConfig;
      if (!webdavEndpoint || !webdavPassword || !webdavUsername) {
        alert('Please complete all Webdav configuration fields');
        return;
      }
    }

    api.setConfig(config).then(() => {
      notification.success({
        message: 'Success',
        description: 'Configuration updated successfully',
      });
    }).catch((error) => {
      notification.error({
        message: 'Update Failed',
        description: `There was an error updating the configuration: ${error.message}`,
      });
    });
  };


  export default handleSubmit;