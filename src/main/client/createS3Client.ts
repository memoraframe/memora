import { S3Client } from "@aws-sdk/client-s3";
import MemoraConfig from "../../types/MemoraConfig";

export function createS3Client(config: MemoraConfig): S3Client {
    return new S3Client({
      region: config.s3Config.s3Region,
      credentials: {
          accessKeyId: config.s3Config.s3AccessKeyId,
          secretAccessKey: config.s3Config.s3SecretAccessKey,
      },
      forcePathStyle: config.s3Config.s3ForcePathStyle,
      endpoint: config.s3Config.s3Endpoint
  })
  }
  