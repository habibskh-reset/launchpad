let globalAudioCtx: AudioContext | null = null;

export function initAudioContext(): void {
  if (globalAudioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
    }
  } catch {
    // Suppressed
  }
}

export function playReminderChime(): void {
  try {
    if (!globalAudioCtx) initAudioContext();
    const ctx = globalAudioCtx;
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Dual chime tone
    playTone(880, now, 0.18);
    playTone(1320, now + 0.15, 0.35);

  } catch {
    // Suppressed if blocked by policy
  }
}