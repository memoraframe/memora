import { error, log } from "electron-log";
import MemoraConfig from "../types/MemoraConfig";
import { createS3Client } from "./client/createS3Client";
import { createWebdavClient } from "./client/createWebdavClient";
import { syncLocalWithS3 } from "./syncLocalWithS3";
import { syncLocalWithWebdav } from "./syncLocalWithWebdav";
import { isImage } from "./isImage";
import { promises as fs } from 'fs';

export const ensureTrailingSlash = (path: string) => {
  return path.endsWith('/') ? path : path + '/';
};
export const thumbnailDirectory = "thumbnails"

export async function listLocalFiles(localDir: string): Promise<string[]> {
  return (await fs.readdir(localDir, {
      recursive: true,
      encoding: 'utf8',
  }))
  .filter(f => !f.startsWith(thumbnailDirectory))
  .filter(f => isImage(f))
}

export const scheduler = (config: MemoraConfig) => {
  // syncThumbnails(config.mediaDirectory)
  //   .then(() => {
  //     log('Finished creating thumbnails');
  //   })
  //   .catch((e) => {
  //     error('Failed creating thumbnails: ' + e)
  //   })


  if (config.s3Config && config.s3Config.s3Enabled) {
    const s3Client = createS3Client(config);

    syncLocalWithS3(
      s3Client,
      config.s3Config.s3Bucket,
      config.mediaDirectory,
      config.s3Config.s3SubDirectory
    )
      .then(() => {
        log('Finished sync with S3');
      })
      .catch((e) => {
        error('Failed sync with S3' + e)
      })
  }

  if (config.webdavConfig && config.webdavConfig.webdavEnabled) {
    const webdavClient = createWebdavClient(config);
    syncLocalWithWebdav(webdavClient, config.mediaDirectory, config.webdavConfig.webdavSubDirectory)
      .then(() => {
        log('Finished sync with Webdav');
      })
      .catch((e) => {
        error('Failed sync with Webdav' + e)
      })
  }
}