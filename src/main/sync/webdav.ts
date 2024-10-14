import { FileStat, WebDAVClient } from "webdav";
import { ExternalSync } from "./externalSync";
import * as path from 'path';
import { log, error } from 'electron-log';
import { promises as fs } from 'fs';
import { ThumbnailService } from "../thumbnailService";

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
        const fileData = await this.client.getFileContents(externalFile);

        let dataToWrite: Buffer;

        if (fileData instanceof ArrayBuffer) {
            dataToWrite = Buffer.from(fileData); // Convert ArrayBuffer to Buffer
        } else if (typeof fileData === 'string' || fileData instanceof Buffer) {
            dataToWrite = Buffer.from(fileData); // Ensure it's a Buffer
        } else {
            throw new Error('Unsupported file data type');
        }
        const thumbnail = await this.thumbnailService.createThumbnail(externalFile, dataToWrite);
        if (thumbnail) {
            await fs.writeFile(localFile, thumbnail);
        } else {
            error(`Failed to create thumbnail for ${localFile}`);
        }
    }

    private isFileStatArray(data: any): data is FileStat[] {
        return Array.isArray(data) && data.length > 0 && 'basename' in data[0];
    }
}