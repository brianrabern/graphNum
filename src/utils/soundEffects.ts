/**
 * Generate an old internet connection sound effect using Web Audio API
 * Mimics dial-up modem/fax machine connection sounds - harsh and mechanical
 */
export function playAlienSound() {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Create oscillators for modem-like connection sound
    const osc1 = audioContext.createOscillator(); // Main carrier tone
    const osc2 = audioContext.createOscillator(); // Secondary tone
    const noise = audioContext.createBufferSource(); // Connection noise
    const gain1 = audioContext.createGain();
    const noiseGain = audioContext.createGain();
    const masterGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Main carrier - harsh square wave like old modems
    osc1.type = "square";
    osc1.frequency.setValueAtTime(425, now); // Dial-up modem frequency range
    osc1.frequency.setValueAtTime(425, now + 0.05);
    osc1.frequency.setValueAtTime(850, now + 0.1); // Quick frequency hop
    osc1.frequency.setValueAtTime(850, now + 0.15);

    // Secondary tone - creates that modem handshake sound
    osc2.type = "square";
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.setValueAtTime(600, now + 0.05);
    osc2.frequency.setValueAtTime(1200, now + 0.1);
    osc2.frequency.setValueAtTime(1200, now + 0.15);

    // Create harsh noise for connection texture
    const bufferSize = audioContext.sampleRate * 0.15;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noise.buffer = noiseBuffer;
    noise.loop = false;

    // Bandpass filter to mimic phone line frequency response
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(5, now); // Less resonant, more raw

    // Connect: oscillators -> filter -> gains -> master
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain1);

    noise.connect(noiseGain);

    gain1.connect(masterGain);
    noiseGain.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Harsh, mechanical envelopes - quick attack, sustained, quick decay
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.5, now + 0.01); // Quick attack
    gain1.gain.setValueAtTime(0.5, now + 0.05);
    gain1.gain.setValueAtTime(0.5, now + 0.1);
    gain1.gain.setValueAtTime(0.5, now + 0.15);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18); // Quick decay

    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    noiseGain.gain.setValueAtTime(0.2, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    masterGain.gain.setValueAtTime(0.4, now);

    // Start all sources
    osc1.start(now);
    osc2.start(now);
    noise.start(now);

    // Stop sources
    osc1.stop(now + 0.18);
    osc2.stop(now + 0.18);
    noise.stop(now + 0.15);

    // Clean up
    setTimeout(() => {
      audioContext.close();
    }, 500);
  } catch (error) {
    // Silently fail if audio context is not available
    // Audio context not available - user's browser may not support Web Audio API
  }
}
