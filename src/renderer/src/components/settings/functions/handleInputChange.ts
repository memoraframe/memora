import MemoraConfig from "@types/MemoraConfig";

const handleInputChange = (setConfig: React.Dispatch<React.SetStateAction<MemoraConfig | undefined>>, name: string, value: any) => {
    // @ts-ignore
    setConfig((prevConfig) => {
      if(!prevConfig) {
        return;
      }
      if (name in prevConfig.s3Config!) {
        return {
          ...prevConfig,
          s3Config: {
            ...prevConfig.s3Config,
            [name]: value,
          },
        };
      } 
      else if (name in prevConfig.webdavConfig!) {
        return {
          ...prevConfig,
          webdavConfig: {
            ...prevConfig.webdavConfig,
            [name]: value,
          },
        };
      }
      else {
        return {
          ...prevConfig,
          [name]: value,
        };
      }
    });
  };
  export default handleInputChange;