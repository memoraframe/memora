export const isVideo = (src: unknown = ''): boolean => {
  if (typeof src !== 'string') {
    return false;
  }

  return /\.(mp4|webm|ogg|avi|mov)$/i.test(src.trim());
};