/**
 * Clock tick audio synthesizer copied directly from Reference/clock-tick-test.html.
 * Excises any artificial blocking state and handles dynamic Web Audio API context initialization.
 */
let AC = null;

function initAudio() {
  if (AC) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    AC = new AudioContextClass();
  }
}

function resumeAudio() {
  if (AC && AC.state === 'suspended') {
    AC.resume().catch(err => console.warn('Failed to resume AudioContext:', err));
  }
}

let alt = false;

function tick(vel) {
  initAudio();
  resumeAudio();
  if (!AC) return;

  vel      = Math.max(0.12, Math.min(1.0, vel));
  alt      = !alt;
  const p  = alt ? 1.0 : 0.94;   // slight pitch alternation for haptic realism
  const t  = AC.currentTime;

  const SR     = AC.sampleRate;
  const nLen   = Math.floor(SR * 0.008); // 8ms buffer is plenty
  const nBuf   = AC.createBuffer(1, nLen, SR);
  const nData  = nBuf.getChannelData(0);
  
  for (let i = 0; i < nLen; i++) {
    // Super fast exponential decay for premium haptic click (nearly zero after 3ms)
    const env  = Math.exp(-i / (SR * 0.0011));
    nData[i]   = (Math.random() * 2 - 1) * env;
  }

  const nSrc = AC.createBufferSource();
  nSrc.buffer = nBuf;

  // Parallel bandpass filters to capture the mechanical click spectrum of mixkit wave
  const bp1   = AC.createBiquadFilter();
  bp1.type    = 'bandpass';
  bp1.frequency.value = 6100 * p;
  bp1.Q.value         = 3.5;

  const bp2   = AC.createBiquadFilter();
  bp2.type    = 'bandpass';
  bp2.frequency.value = 4200 * p;
  bp2.Q.value         = 2.5;

  const hp   = AC.createBiquadFilter();
  hp.type    = 'highpass';
  hp.frequency.value = 2500; // Remove all low/muddy body resonances

  const nGain = AC.createGain();
  nGain.gain.setValueAtTime(0, t);
  nGain.gain.linearRampToValueAtTime(0.40 * vel, t + 0.0001); // Instant attack (0.1ms)
  nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.0035); // Extremely clean decay in 3.5ms

  // Connect parallel filters to shape noise spectrum
  nSrc.connect(bp1);
  nSrc.connect(bp2);
  
  bp1.connect(hp);
  bp2.connect(hp);
  
  hp.connect(nGain);
  nGain.connect(AC.destination);
  
  nSrc.start(t);
  nSrc.stop(t + 0.008);
}

// Expose functions globally under window.timePickerAudio namespace
window.timePickerAudio = {
  playTick: tick,
  init: initAudio,
  resume: resumeAudio
};

// Global document-level user interaction triggers to unlock the AudioContext immediately
(function() {
  const unlock = () => {
    initAudio();
    resumeAudio();
    // Remove listeners once audio context is unlocked
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('touchend', unlock);
    document.removeEventListener('keydown', unlock);
    document.removeEventListener('mousedown', unlock);
    document.removeEventListener('mouseup', unlock);
    document.removeEventListener('pointerdown', unlock);
  };
  document.addEventListener('click', unlock);
  document.addEventListener('touchstart', unlock);
  document.addEventListener('touchend', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('mousedown', unlock);
  document.addEventListener('mouseup', unlock);
  document.addEventListener('pointerdown', unlock);
})();
