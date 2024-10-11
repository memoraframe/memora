import { promises as fs } from 'fs';
import { ensureTrailingSlash, listLocalFiles, thumbnailDirectory } from './scheduler';
import sharp from 'sharp';
import path from 'path';
// Delay function that returns a promise that resolves after a specified duration
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Create a thumbnail for a given image source
async function createThumbnail(src: string): Promise<Buffer | null> {
    console.log("create thumbnail: " + src);
    try {
        const imageBuffer = await fs.readFile(src);
        const thumbnail = await sharp(imageBuffer)
            .resize({ width: 300, height: 300, fit: sharp.fit.inside }) 
            .toBuffer();
        return thumbnail; // Return the thumbnail buffer
    } catch (error) {
        console.error("Error processing thumbnail:", error);
        return null; // Return null on error
    }
}

// Sync local directory with S3 bucket
export async function syncThumbnails(localDir: string): Promise<void> {
    const localFiles = await listLocalFiles(ensureTrailingSlash(localDir));

    for (const file of localFiles) {
        const thumbnailPath = path.join(ensureTrailingSlash(localDir), thumbnailDirectory, file);

        try {
            await fs.access(thumbnailPath);
        } catch {
            const thumbnailBuffer = await createThumbnail(ensureTrailingSlash(localDir) + file);
            if (thumbnailBuffer) {
                console.log("save thumbnail: " + thumbnailPath);
                await fs.mkdir(path.dirname(thumbnailPath), { recursive: true }); // Ensure the directory exists
                await fs.writeFile(thumbnailPath, thumbnailBuffer);
            }
        }

        // Introduce a delay of 1000 milliseconds (1 second) between thumbnail generations
        await delay(1000); // Adjust the delay time as needed
    }
    // Remove thumbnails that should not be there
    const existingThumbnails = await fs.readdir(path.join(ensureTrailingSlash(localDir), thumbnailDirectory));
    const validThumbnailNames = localFiles.map(file => path.basename(file));

    for (const thumbnail of existingThumbnails) {
        if (!validThumbnailNames.includes(thumbnail)) {
            await fs.unlink(path.join(localDir, thumbnailDirectory, thumbnail)); // Remove unwanted thumbnail
        }
    }
}
