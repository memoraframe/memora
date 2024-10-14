import { error, log } from "electron-log";
import MemoraConfig from "../types/MemoraConfig";
import { isImage } from "./isImage";
import { promises as fs } from 'fs';
import { WebDav } from "./sync/webdav";

import * as path from 'path';
import { createWebdavClient } from "./sync/client/createWebdavClient";
import { createS3Client } from "./sync/client/createS3Client";
import { syncLocalWithS3 } from "./sync/syncLocalWithS3";
import { ThumbnailService } from "./thumbnailService";

export const ensureTrailingSlash = (path: string) => {
  return path.endsWith('/') ? path : path + '/';
};
export const thumbnailDirectory = "thumbnails"

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listLocalFiles(localDir: string): Promise<string[]> {
  return (await fs.readdir(localDir, {
    recursive: true,
    encoding: 'utf8',
  }))
    .filter(f => !f.startsWith(thumbnailDirectory))
    .filter(f => isImage(f))
}

export const scheduler = async (config: MemoraConfig) => {
  const thumbnailService = new ThumbnailService(true, 1280, 800);

  if (config.webdavConfig && config.webdavConfig.webdavEnabled) {
    const mediaDir = config.mediaDirectory

    const webdavClient = createWebdavClient(config);
    const syncClient = new WebDav(webdavClient, config.webdavConfig.webdavSubDirectory, thumbnailService)
    const externalFiles = await syncClient.listExternalFiles()

    const externalFilesMap = new Set(externalFiles.map(file => path.relative(config.webdavConfig.webdavSubDirectory, file)));

    // Get all files from local directory
    const localFilePaths = await listLocalFiles(mediaDir);
    const localFileMap = new Set(localFilePaths.map(file => path.relative(mediaDir, file)));

    // Download files from WebDAV that are missing locally
    for (const externalFilePath of externalFiles) {
      const relativePath = path.relative(config.webdavConfig.webdavSubDirectory, externalFilePath);
      const localFilePath = path.join(mediaDir, relativePath);

      await fs.mkdir(path.dirname(localFilePath), { recursive: true });

      if (!localFileMap.has(relativePath)) {
        syncClient.syncFile(externalFilePath, localFilePath)
        await delay(5000); // Delay time to fix memory issues with this
      }
    }

    // Remove files locally that are not in WebDAV
    for (const localFilePath of localFilePaths) {
      const relativePath = path.relative(mediaDir, localFilePath);
      if (!externalFilesMap.has(relativePath)) {
        log(`Removing local file ${localFilePath}`);
        await fs.unlink(localFilePath);
      }
    }
  }


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

  // if (config.webdavConfig && config.webdavConfig.webdavEnabled) {
  //   const webdavClient = createWebdavClient(config);

  //   syncLocalWithWebdav(webdavClient, config.mediaDirectory, config.webdavConfig.webdavSubDirectory)
  //     .then(() => {
  //       log('Finished sync with Webdav');
  //     })
  //     .catch((e) => {
  //       error('Failed sync with Webdav' + e)
  //     })
  // }
}