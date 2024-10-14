import { ExternalSync } from "./externalSync";
import { createWriteStream } from 'fs';
import { ThumbnailService } from "../thumbnailService";
import { GetObjectCommand, ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { isMediaFile } from "../isMedia";

import * as stream from 'stream';

export class S3 extends ExternalSync {
    private client: S3Client;
    private thumbnailService: ThumbnailService;
    private bucketName: string;
    private prefix: string;

    constructor(client: S3Client, thumbnailService: ThumbnailService, bucketName: string, prefix: string) {
        super();
        this.client = client;
        this.thumbnailService = thumbnailService
        this.bucketName = bucketName;
        this.prefix = prefix;
    }

    async listExternalFiles(): Promise<string[]> {
        let isTruncated = true;
        let marker: string | undefined = undefined;
        const allKeys: string[] = [];
    
        while (isTruncated) {
            const command = new ListObjectsCommand({
                Bucket: this.bucketName,
                Prefix: this.prefix,
                Marker: marker, // Use marker for pagination
            });
    
            const response = await this.client.send(command);
            const keys = response.Contents?.map((object) => object.Key!) || [];
            const imageFiles = keys.filter(isMediaFile);
    
            allKeys.push(...imageFiles);
    
            isTruncated = response.IsTruncated ?? false; // Check if there are more objects to list
            marker = keys.length > 0 ? keys[keys.length - 1] : undefined; // Set marker for the next request
        }
    
        return allKeys;
    }

    async syncFile(externalFile: string, localFile: string): Promise<void> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: externalFile,
        });
    
        const response = await this.client.send(command);
        const fileStream = response.Body as stream.Readable;
    
        // Convert stream to buffer
        const chunks: Buffer[] = [];
        fileStream.on('data', (chunk) => chunks.push(chunk));
        await new Promise<void>((resolve, reject) => {
            fileStream.on('end', resolve);
            fileStream.on('error', reject);
        });
        const fileBuffer = Buffer.concat(chunks);
    
        // Process the buffer through ThumbnailService
        const thumbnailBuffer = await this.thumbnailService.createThumbnail(externalFile, fileBuffer);
    
        if (!thumbnailBuffer) {
            console.error("Failed to create thumbnail.");
            return;
        }
    
        // Write the thumbnail buffer to the local file
        const writeStream = createWriteStream(localFile);
        writeStream.write(thumbnailBuffer);
        writeStream.end();
    
        // Handle stream completion
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }
    
}