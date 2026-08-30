let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function playCheckSound(): void {
  const ac = audioContext();
  if (!ac) return;
  void ac.resume();
  const now = ac.currentTime;

  const tick = ac.createOscillator();
  const tickGain = ac.createGain();
  tick.type = "triangle";
  tick.frequency.setValueAtTime(620, now);
  tick.frequency.exponentialRampToValueAtTime(280, now + 0.09);
  tickGain.gain.setValueAtTime(0.0001, now);
  tickGain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  tick.connect(tickGain);
  tickGain.connect(ac.destination);
  tick.start(now);
  tick.stop(now + 0.16);

  const body = ac.createOscillator();
  const bodyGain = ac.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(180, now);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  body.connect(bodyGain);
  bodyGain.connect(ac.destination);
  body.start(now);
  body.stop(now + 0.2);
}
