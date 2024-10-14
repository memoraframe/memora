import { promises as fs } from 'fs';
import { ensureTrailingSlash, listLocalFiles, thumbnailDirectory } from './scheduler';
import path from 'path';
import { log } from 'electron-log';
import { ThumbnailService } from './thumbnailService';
// Delay function that returns a promise that resolves after a specified duration
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Sync local directory with S3 bucket
export async function syncThumbnails(localDir: string): Promise<void> {
    const thumbnailService = new ThumbnailService(true, 300, 300)
    const localFiles = await listLocalFiles(ensureTrailingSlash(localDir));

    for (const file of localFiles) {
        const thumbnailPath = path.join(ensureTrailingSlash(localDir), thumbnailDirectory, file);

        try {
            await fs.access(thumbnailPath);
        } catch {
            const imageBuffer = await fs.readFile(ensureTrailingSlash(localDir) + file); // Read the file into a buffer
            const thumbnailBuffer = await thumbnailService.createThumbnail(ensureTrailingSlash(localDir) + file, imageBuffer);
            if (thumbnailBuffer) {
                log("save thumbnail: " + thumbnailPath);
                await fs.mkdir(path.dirname(thumbnailPath), { recursive: true }); // Ensure the directory exists
                await fs.writeFile(thumbnailPath, thumbnailBuffer);
            }
        }

        // Introduce a delay of 1000 milliseconds (1 second) between thumbnail generations
        await delay(2000); // Adjust the delay time as needed
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
