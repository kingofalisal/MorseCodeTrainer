export const MORSE_CODE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
  '/': '-..-.'
};

export function getMorseTimings(wpm, farnsworth = false) {
  const dotDuration = 1200 / wpm;
  if (!farnsworth) {
    return {
      dot: dotDuration,
      dash: dotDuration * 3,
      intraChar: dotDuration,
      interChar: dotDuration * 3,
      wordGap: dotDuration * 7,
    };
  }
  const charWpm = Math.max(wpm, 18);
  const charDot = 1200 / charWpm;
  const totalTime = 60000 / wpm;
  const charTime = 31 * charDot;
  const gapTime = totalTime - charTime;
  const gapUnit = gapTime / 19;
  return {
    dot: charDot,
    dash: charDot * 3,
    intraChar: charDot,
    interChar: Math.max(gapUnit * 3, charDot * 3),
    wordGap: Math.max(gapUnit * 7, charDot * 7),
  };
}

export function buildMorseSequence(text, timings) {
  const sequence = [];
  const chars = text.toUpperCase().split('');
  chars.forEach((char, ci) => {
    if (char === ' ') {
      if (sequence.length > 0) sequence.push({ type: 'gap', duration: timings.wordGap });
      return;
    }
    const code = MORSE_CODE[char];
    if (!code) return;
    const elements = code.split('');
    elements.forEach((el, ei) => {
      if (el === '.') sequence.push({ type: 'dot', duration: timings.dot });
      else if (el === '-') sequence.push({ type: 'dash', duration: timings.dash });
      if (ei < elements.length - 1) sequence.push({ type: 'gap', duration: timings.intraChar });
    });
    if (ci < chars.length - 1 && chars[ci + 1] !== ' ') {
      sequence.push({ type: 'gap', duration: timings.interChar });
    }
  });
  return sequence;
}

export class MorsePlayer {
  constructor() {
    this.ctx = null;
    this.stopFlag = false;
    this.playing = false;
    this.unlocked = false;
  }

  async _getCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  // Call this on any user gesture (tap/click) to unlock audio on iOS
  async unlock() {
    if (this.unlocked) return;
    try {
      const ctx = await this._getCtx();
      // Play a silent buffer — this is the iOS unlock trick
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      await ctx.resume();
      this.unlocked = true;
    } catch (e) {
      console.warn('Audio unlock failed:', e);
    }
  }

  stop() {
    this.stopFlag = true;
    this.playing = false;
  }

  async play(sequence, frequency = 700, onDone) {
    this.stopFlag = false;
    this.playing = true;
    const ctx = await this._getCtx();
    await ctx.resume();

    for (const item of sequence) {
      if (this.stopFlag) break;
      if (item.type === 'gap') {
        await new Promise(r => setTimeout(r, item.duration));
      } else {
        await new Promise((resolve) => {
          if (this.stopFlag) { resolve(); return; }
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = frequency;
          osc.type = 'sine';
          const now = ctx.currentTime;
          const dur = item.duration / 1000;
          const ramp = Math.min(0.005, dur * 0.1);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.7, now + ramp);
          gain.gain.setValueAtTime(0.7, now + dur - ramp);
          gain.gain.linearRampToValueAtTime(0, now + dur);
          osc.start(now);
          osc.stop(now + dur);
          osc.onended = resolve;
        });
      }
    }

    this.playing = false;
    if (!this.stopFlag && onDone) onDone();
  }
}
