import path from "path";

// Supported image and video file extensions
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']);
const videoExtensions = new Set(['.mp4', '.avi', '.mkv', '.mov', '.wmv']);


export const isMediaFile = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    return imageExtensions.has(ext) || videoExtensions.has(ext);
  };