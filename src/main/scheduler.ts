import { log, error } from "electron-log";
import MemoraConfig from "../types/MemoraConfig";
import { isImage } from "./isImage";
import { promises as fs } from 'fs';
import { WebDav } from "./sync/webdav";

import * as path from 'path';
import { createWebdavClient } from "./sync/client/createWebdavClient";
import { createS3Client } from "./sync/client/createS3Client";
import { ThumbnailService } from "./thumbnailService";
import { S3 } from "./sync/s3";
import { syncThumbnails } from "./syncThumbnails";

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
  // Nothing configured to schedule.
  if(!config.webdavConfig.webdavEnabled && !config.s3Config.s3Enabled ) {
    return;
  }

  let syncClient;
  const thumbnailService = new ThumbnailService(true, 1280, 800);
  const mediaDir = config.mediaDirectory
  let subDirectory

  if (config.webdavConfig && config.webdavConfig.webdavEnabled) {
    const webdavClient = createWebdavClient(config);
    syncClient = new WebDav(webdavClient, thumbnailService)
    subDirectory = config.webdavConfig.webdavSubDirectory;
  }

  if (config.s3Config && config.s3Config.s3Enabled) {
    const s3Client = createS3Client(config);
    subDirectory = config.s3Config.s3SubDirectory;
    syncClient = new S3(s3Client,thumbnailService, config.s3Config.s3Bucket, subDirectory)
  }

  const externalFiles = await syncClient.listExternalFiles()

  // Get all files from local directory
  const localFilePaths = await listLocalFiles(mediaDir);

  // Download files  that are missing locally
  for (const externalFilePath of externalFiles) {
    const existsInLocalFile = localFilePaths.some(externalFile =>
      externalFile.endsWith(externalFilePath)
    );

    const relativePath = path.relative(subDirectory, externalFilePath);
    const localFilePath = path.join(mediaDir, relativePath);

    await fs.mkdir(path.dirname(localFilePath), { recursive: true });

    if(!existsInLocalFile) {
      log("Downloading file " + externalFilePath + " to " + localFilePath);
      syncClient.syncFile(externalFilePath, localFilePath)
      await delay(5000); // Delay time to fix memory hog with this
    }
  }

  // Remove files locally
  for (const localFilePath of localFilePaths) {
    const existsInExternalFiles = externalFiles.some(externalFile =>
      externalFile.endsWith(localFilePath)
    );
    if (!existsInExternalFiles) {
      log("Unlink: " + localFilePath)
      await fs.unlink(localFilePath);
    } else {
      log("Keep: " + localFilePath)
    }
  }

  syncThumbnails(config.mediaDirectory).then(() => {
    log("Thumbnails finished")
  }).catch((e) => {
    error("Syncing thumbnails failed" + e)
  })
}