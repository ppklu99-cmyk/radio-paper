export function shouldNudgeStop(elapsedMs: number): boolean {
  return elapsedMs >= 8 * 60 * 1000;
}
