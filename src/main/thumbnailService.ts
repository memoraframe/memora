import sharp from "sharp";
import { isImage } from "./isImage";

export class ThumbnailService {
    constructor(private enabled: boolean, private width: number, private height: number) {
        this.enabled = enabled;
        this.width = width;
        this.height = height;
    }

    getSharpTransformStream() {
        return sharp().resize({ width: this.width, height: this.height, fit: sharp.fit.inside })
    }

    isThumbnailAvailable(fileName: string): boolean {
        if (!this.enabled) {
            return false;
        }

        // For now only images
        if(!isImage(fileName)) {
            return false;
        }

        return true;
                
    }

    async createThumbnail(fileName: string, imageBuffer: Buffer): Promise<Buffer | null> {
        if (!this.enabled) {
            return imageBuffer;
        }

        // For now only images
        if(!isImage(fileName)) {
            return imageBuffer;
        }
        

        try {
            const thumbnail = await sharp(imageBuffer)
                .resize({ width: this.width, height: this.height, fit: sharp.fit.inside })
                .toBuffer();
            
            return thumbnail; // Return the thumbnail buffer
        } catch (error) {
            console.error("Error processing thumbnail:", error);
            return null; // Return null on error
        }
    }

}