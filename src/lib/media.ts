const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export function isVideoSrc(src: string): boolean {
  const path = src.split(/[?#]/, 1)[0] ?? src;
  return VIDEO_EXT.test(path);
}

export function shouldSeekToStart(
  currentTime: number,
  startTime: number,
  endTime: number,
): boolean {
  return currentTime >= endTime - 0.02 || currentTime < startTime - 0.02;
}
