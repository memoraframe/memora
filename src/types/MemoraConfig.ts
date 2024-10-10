export enum Transformation {
    ROTATE = 'ROTATE',
    SLIDEX = 'SLIDEX',
    SCALE = 'SCALE',
    SLIDEY = 'SLIDEY',
    SKEW = 'SKEW',
    FLIP = 'FLIP',
    PERSPECTIVE = 'PERSPECTIVE'
  }
interface s3Config {
    s3SubDirectory: string;
    s3Endpoint: string,
    s3ForcePathStyle: boolean,
    s3Region: string
    s3SecretAccessKey: string;
    s3AccessKeyId: string;
    s3Enabled: boolean,
    s3Bucket: string,
}
interface webdavConfig {
    webdavEnabled: boolean,
    webdavSubDirectory: string;
    webdavEndpoint: string,
    webdavUsername: string,
    webdavPassword: string
}

export default interface MemoraConfig {
    slideTimeout: number,
    showProgressBar: boolean,
    transformation: Transformation
    s3Config: s3Config,
    webdavConfig: webdavConfig,
    mediaDirectory: string,
}

