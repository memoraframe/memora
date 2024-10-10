import { isImage } from "./isImage";
import { isVideo } from "./isVideo";

export const isDirectory = (src: string): boolean => {
    return !isImage(src) && !isVideo(src)
};