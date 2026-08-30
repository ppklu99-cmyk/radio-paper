let unlocked = false;

export async function unlockAudio(): Promise<void> {
  if (unlocked) return;
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) {
    unlocked = true;
    return;
  }
  const ctx = new Ctx();
  await ctx.resume();
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  unlocked = true;
}
