import { log, error } from "electron-log";
import MemoraConfig from "../types/MemoraConfig";
import { promises as fs } from 'fs';
import { WebDav } from "./sync/webdav";

import * as path from 'path';
import { createWebdavClient } from "./sync/client/createWebdavClient";
import { createS3Client } from "./sync/client/createS3Client";
import { ThumbnailService } from "./thumbnailService";
import { S3 } from "./sync/s3";
import { syncThumbnails } from "./syncThumbnails";
import { isMediaFile } from "./isMedia";
import { WebContents } from "electron";

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
    .filter(f => isMediaFile(f))
}


export const scheduler = async (config: MemoraConfig, webContents: WebContents) => {
  // Nothing configured to schedule.
  if (!config.webdavConfig.webdavEnabled && !config.s3Config.s3Enabled) {
    return;
  }

  webContents.send('sync:start');

  let syncClient;
  const thumbnailService = new ThumbnailService(true, 1280, 800);
  const mediaDir = config.mediaDirectory;
  let subDirectory;

  try {
    if (config.webdavConfig && config.webdavConfig.webdavEnabled) {
      const webdavClient = createWebdavClient(config);
      syncClient = new WebDav(webdavClient, thumbnailService);
      subDirectory = config.webdavConfig.webdavSubDirectory;
    }

    if (config.s3Config && config.s3Config.s3Enabled) {
      const s3Client = createS3Client(config);
      subDirectory = config.s3Config.s3SubDirectory;
      syncClient = new S3(s3Client, thumbnailService, config.s3Config.s3Bucket, subDirectory);
    }

    const externalFiles = await syncClient.listExternalFiles();

    // Get all files from local directory
    const localFilePaths = await listLocalFiles(mediaDir);

    // Download files that are missing locally
    for (const externalFilePath of externalFiles) {
      if (!isMediaFile(externalFilePath)) {
        log("Skip file, not media: " + externalFilePath);
        continue;
      }

      const existsInLocalFile = localFilePaths.some(localFile => 
        externalFilePath.endsWith(localFile)
      );

      if (!existsInLocalFile) {
        webContents.send('sync:download:start', externalFilePath);
        const relativePath = path.relative(subDirectory, externalFilePath);
        const localFilePath = path.join(mediaDir, relativePath);
        
        log("Downloading file " + externalFilePath);

        await fs.mkdir(path.dirname(localFilePath), { recursive: true });
        await syncClient.syncFile(externalFilePath, localFilePath);
        webContents.send('sync:download:stop', externalFilePath);
        await delay(5000); // Delay time to fix memory hog with this
      } else {
        log("Skip file: " + externalFilePath);
      }
    }

    // Remove files locally
    for (const localFilePath of localFilePaths) {
      const existsInExternalFiles = externalFiles.some(externalFile =>
        externalFile.endsWith(localFilePath)
      );
      if (!existsInExternalFiles) {
        log("Unlink: " + localFilePath);
        await fs.unlink(localFilePath);
      } else {
        log("Keep: " + localFilePath);
      }
    }

    await syncThumbnails(config.mediaDirectory);
    log("Thumbnails finished");
  } catch (e) {
    // Handle the error globally
    error("An error occurred during the sync process: " + e);
    webContents.send('sync:error', e);
  } finally {
    webContents.send('sync:stop');
  }
}
