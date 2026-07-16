// Morse code table
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

// Standard Morse timing ratios (based on dot = 1 unit)
// dot=1, dash=3, intra-char gap=1, inter-char gap=3, word gap=7
export function getMorseTimings(wpm, farnsworth = false) {
  // PARIS standard: one "PARIS" = 50 dot units at given WPM
  const dotDuration = 1200 / wpm; // ms per dot at full speed

  if (!farnsworth) {
    return {
      dot: dotDuration,
      dash: dotDuration * 3,
      intraChar: dotDuration,       // gap between dots/dashes in same letter
      interChar: dotDuration * 3,   // gap between letters
      wordGap: dotDuration * 7,     // gap between words
    };
  }

  // Farnsworth: characters play at 18 WPM rate, gaps stretch to achieve overall WPM
  const charWpm = Math.max(wpm, 18);
  const charDot = 1200 / charWpm;

  // Calculate total time for PARIS at char speed vs desired overall WPM
  // PARIS has 31 element durations (dots/dashes) and 19 gap units (intra+inter+word)
  const totalTime = 60000 / wpm; // ms for one PARIS word
  const charTime = 31 * charDot; // fixed character element time
  const gapTime = totalTime - charTime;
  const gapUnit = gapTime / 19; // distribute remaining time across gap units

  return {
    dot: charDot,
    dash: charDot * 3,
    intraChar: charDot,
    interChar: Math.max(gapUnit * 3, charDot * 3),
    wordGap: Math.max(gapUnit * 7, charDot * 7),
  };
}

// Build a sequence of {type:'dot'|'dash'|'gap', duration} for a string
export function buildMorseSequence(text, timings) {
  const sequence = [];
  const chars = text.toUpperCase().split('');

  chars.forEach((char, ci) => {
    if (char === ' ') {
      // word gap already handled by inter-char, add extra
      if (sequence.length > 0) {
        sequence.push({ type: 'gap', duration: timings.wordGap });
      }
      return;
    }

    const code = MORSE_CODE[char];
    if (!code) return;

    const elements = code.split('');
    elements.forEach((el, ei) => {
      if (el === '.') sequence.push({ type: 'dot', duration: timings.dot });
      else if (el === '-') sequence.push({ type: 'dash', duration: timings.dash });

      // intra-character gap (not after last element)
      if (ei < elements.length - 1) {
        sequence.push({ type: 'gap', duration: timings.intraChar });
      }
    });

    // inter-character gap (not after last character)
    if (ci < chars.length - 1 && chars[ci + 1] !== ' ') {
      sequence.push({ type: 'gap', duration: timings.interChar });
    }
  });

  return sequence;
}

// Web Audio API player
export class MorsePlayer {
  constructor() {
    this.ctx = null;
    this.stopFlag = false;
    this.playing = false;
  }

  _getCtx() {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  stop() {
    this.stopFlag = true;
    this.playing = false;
  }

  async play(sequence, frequency = 700, onDone) {
    this.stopFlag = false;
    this.playing = true;
    const ctx = this._getCtx();

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

          // Slight envelope to avoid clicks
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
