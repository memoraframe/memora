import { FileStat, WebDAVClient } from "webdav";
import { ExternalSync } from "./externalSync";
import * as path from 'path';
import electronLog from 'electron-log';
const { error } = electronLog;
import fs from 'fs'; 
import { ThumbnailService } from "../thumbnailService";
import { pipeline } from 'stream/promises';
import stream from 'stream';

export class WebDav extends ExternalSync {
    private client: WebDAVClient;
    private thumbnailService: ThumbnailService

    constructor(client: WebDAVClient, thumbnailService: ThumbnailService) {
        super();
        this.client = client;
        this.thumbnailService = thumbnailService
    }

    async listExternalFiles(dir?: string): Promise<string[]> {
        if(!dir) { dir = ""}

        const result = await this.client.getDirectoryContents(dir);

        // Determine if result is a FileStat[] or ResponseDataDetailed<FileStat[]>
        let entries: FileStat[];

        if (this.isFileStatArray(result)) {
            entries = result;
        } else {
            entries = result.data; // Assuming the actual data is in `data` property
        }

        let fileList: string[] = [];
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.basename);
            if (entry.type === 'directory') {
                fileList = fileList.concat(await this.listExternalFiles(fullPath));
            } else {
                fileList.push(fullPath);
            }
        }
        return fileList;
    }
    async syncFile(externalFile: string, localFile: string): Promise<void> {
        try {
            // Fetch the file data (this will still load the file in memory)
            const fileData = await this.client.getFileContents(externalFile);
    
            // Convert the data to Buffer if necessary
            const dataToWrite = fileData instanceof ArrayBuffer
                ? Buffer.from(fileData)
                : Buffer.isBuffer(fileData)
                ? fileData
                : Buffer.from(fileData as string);
    
            // Create a readable stream from the buffer data
            const readableStream = stream.Readable.from(dataToWrite);
    
            // Check if the file is an image
            if (this.thumbnailService.isThumbnailAvailable(externalFile)) {
                // Get the transform stream if it's an image
                const transformStream = this.thumbnailService.getSharpTransformStream();
    
                // Open a writable stream to the local file
                const writableStream = fs.createWriteStream(localFile);
    
                // Use pipeline to handle streaming from input to output through sharp
                await pipeline(readableStream, transformStream, writableStream);
            } else {
                // For non-images, simply copy the data to the local file
                const writableStream = fs.createWriteStream(localFile);
    
                // Use pipeline to directly write the file without transformation
                await pipeline(readableStream, writableStream);
            }
    
        } catch (e) {
            error(`Failed to sync ${localFile}:`, e);
        }
    }
    

    private isFileStatArray(data: any): data is FileStat[] {
        return Array.isArray(data) && data.length > 0 && 'basename' in data[0];
    }
}