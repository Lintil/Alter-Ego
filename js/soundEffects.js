/**
 * ALTER EGO - Celestial Audio Synthesizer (Web Audio API)
 * Generates delicate harmonic tones with zero external asset dependencies.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('alter_ego_audio_muted') !== 'true';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('alter_ego_audio_muted', (!this.enabled).toString());
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.35, gainLevel = 0.12, attack = 0.03) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  }

  playClick() {
    this.playTone(520, 'sine', 0.1, 0.05, 0.01);
  }

  playSelect() {
    this.playTone(659.25, 'sine', 0.25, 0.08, 0.02); // E5
  }

  playNext() {
    if (!this.enabled) return;
    this.playTone(587.33, 'triangle', 0.18, 0.06, 0.02); // D5
    setTimeout(() => this.playTone(880, 'sine', 0.28, 0.07, 0.02), 70); // A5
  }

  playReveal() {
    if (!this.enabled) return;
    // Celestial chord: C5, E5, G5, B5, D6
    const chord = [523.25, 659.25, 783.99, 987.77, 1174.66];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 1.6, 0.06, 0.15);
      }, idx * 110);
    });
  }
}

export const sound = new SoundController();
