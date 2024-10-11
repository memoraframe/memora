import { WebDAVClient } from 'webdav';
import { listLocalFiles } from './scheduler';
import { promises as fs } from 'fs';
import * as path from 'path';
import { log } from 'electron-log';

// Type definitions
interface FileStat {
    basename: string;
    type: 'file' | 'directory';
}

// Function to determine if an object is a FileStat[]
function isFileStatArray(data: any): data is FileStat[] {
    return Array.isArray(data) && data.length > 0 && 'basename' in data[0];
}

// Recursively get all files from a WebDAV directory
async function getWebdavFileList(webdavClient: WebDAVClient, dir: string): Promise<string[]> {
    const result = await webdavClient.getDirectoryContents(dir);

    // Determine if result is a FileStat[] or ResponseDataDetailed<FileStat[]>
    let entries: FileStat[];

    if (isFileStatArray(result)) {
        entries = result;
    } else {
        entries = result.data; // Assuming the actual data is in `data` property
    }

    let fileList: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.basename);
        if (entry.type === 'directory') {
            fileList = fileList.concat(await getWebdavFileList(webdavClient, fullPath));
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

// Sync function
export async function syncLocalWithWebdav(
    webdavClient: WebDAVClient,
    localDir: string,
    webDavSubDir: string = ''
): Promise<void> {
    // Get all files from WebDAV
    const webdavFilePaths = await getWebdavFileList(webdavClient, webDavSubDir);
    const webdavFileMap = new Set(webdavFilePaths.map(file => path.relative(webDavSubDir, file)));

    // Get all files from local directory
    const localFilePaths = await listLocalFiles(localDir);
    const localFileMap = new Set(localFilePaths.map(file => path.relative(localDir, file)));

    // Download files from WebDAV that are missing locally
    for (const webdavFilePath of webdavFilePaths) {
        const relativePath = path.relative(webDavSubDir, webdavFilePath);
        const localFilePath = path.join(localDir, relativePath);

        // Ensure directory structure exists
        await fs.mkdir(path.dirname(localFilePath), { recursive: true });

        if (!localFileMap.has(relativePath)) {
            log(`Downloading ${webdavFilePath} to ${localFilePath}`);
            const fileData = await webdavClient.getFileContents(webdavFilePath);

            // Convert fileData to Buffer if it's an ArrayBuffer
            let dataToWrite: string | Buffer;
    
            if (fileData instanceof ArrayBuffer) {
                dataToWrite = Buffer.from(fileData); // Convert ArrayBuffer to Buffer
            } else if (typeof fileData === 'string') {
                dataToWrite = fileData; // It's already a string
            } else if (fileData instanceof Buffer) {
                dataToWrite = fileData; // It's already a Buffer
            } else {
                // Handle the ResponseDataDetailed type or any other cases as needed
                throw new Error('Unsupported file data type');
            }
            await fs.writeFile(localFilePath, dataToWrite);
        }
    }

    // Remove files locally that are not in WebDAV
    for (const localFilePath of localFilePaths) {
        const relativePath = path.relative(localDir, localFilePath);
        if (!webdavFileMap.has(relativePath)) {
            log(`Removing local file ${localFilePath}`);
            await fs.unlink(localFilePath);
        }
    }
}
