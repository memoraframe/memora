import { S3Client, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { createWriteStream } from 'fs';
import { isMediaFile } from './isMedia';

// List all objects in the S3 bucket within a specific subdirectory
async function listS3Objects(s3Client: S3Client, bucketName: string, prefix: string): Promise<string[]> {
    let isTruncated = true;
    let marker: string | undefined = undefined;
    const allKeys: string[] = [];

    while (isTruncated) {
        const command = new ListObjectsCommand({
            Bucket: bucketName,
            Prefix: prefix,
            Marker: marker, // Use marker for pagination
        });

        const response = await s3Client.send(command);
        const keys = response.Contents?.map((object) => object.Key!) || [];
        const imageFiles = keys.filter(isMediaFile);

        allKeys.push(...imageFiles);

        isTruncated = response.IsTruncated ?? false; // Check if there are more objects to list
        marker = keys.length > 0 ? keys[keys.length - 1] : undefined; // Set marker for the next request
    }

    return allKeys;
}


// List all files in the local directory
async function listLocalFiles(localDir: string): Promise<string[]> {
    // const files = await fs.readdir(localDir);
    // return files.map((file) => path.join(localDir, file));

     return (await fs.readdir(localDir, {
         recursive: true,
         encoding: 'utf8',
     }))
     .filter(f => isMediaFile(f))
}

// Download a file from S3
async function downloadFile(s3Client: S3Client, bucketName: string, key: string, localDir: string): Promise<void> {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const response = await s3Client.send(command);
    const fileStream = response.Body as stream.Readable;

    // Keep the S3 directory structure
    const filePath = path.join(localDir, key);

    // Ensure the local directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const writeStream = createWriteStream(filePath);
    fileStream.pipe(writeStream);

    // Use Promise to handle stream completion
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}

const ensureTrailingSlash = (path: string) => {
    return path.endsWith('/') ? path : path + '/';
  };
// Remove a local file
async function removeLocalFile(localDir: string, filePath: string): Promise<void> {
    await fs.unlink(ensureTrailingSlash(localDir) + filePath);
}

// Sync local directory with S3 bucket
export async function syncLocalWithS3(
    s3Client: S3Client,
    bucketName: string,
    localDir: string,
    s3SubDir: string = '' // Add an optional s3SubDir parameter
): Promise<void> {
    const s3Keys = await listS3Objects(s3Client, bucketName, s3SubDir);

    const localFiles = await listLocalFiles(localDir);
    // Download missing files from S3
    for (const key of s3Keys) {
        if (!localFiles.includes(key)) {
            try {
                console.log("Downloading file " + key);
                await downloadFile(s3Client, bucketName, key, localDir);
            } catch (error) {
                console.error("Something went wrong with downloading: " + error);
            }
        }
    }

    // Remove local files that are not in S3
    for (const localFile of localFiles) {
        if (!s3Keys.includes(localFile)) {
            console.log("Removing:" + localFile);
            await removeLocalFile(localDir, localFile);
        }
    }
}
