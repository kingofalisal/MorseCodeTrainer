// Score an answer against the target string
// Rules:
//  - Case insensitive
//  - Positional match: letter at position i vs target[i]
//  - Extra letters penalize: score = correctPositional / max(answer.length, target.length)
//  - Missing letters penalize: same formula handles this
//  - Returns 0-100 percentage

export function scoreAnswer(target, answer) {
  const t = target.toUpperCase().replace(/\s/g, '');
  const a = answer.toUpperCase().replace(/\s/g, '');

  if (!t.length) return 100;
  if (!a.length) return 0;

  const maxLen = Math.max(t.length, a.length);
  let correct = 0;

  for (let i = 0; i < maxLen; i++) {
    if (i < t.length && i < a.length && t[i] === a[i]) {
      correct++;
    }
  }

  return Math.round((correct / maxLen) * 100);
}

// Returns a character-by-character comparison array for display
export function getCharComparison(target, answer) {
  const t = target.toUpperCase().replace(/\s/g, '');
  const a = answer.toUpperCase().replace(/\s/g, '');
  const maxLen = Math.max(t.length, a.length);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const tc = i < t.length ? t[i] : null;
    const ac = i < a.length ? a[i] : null;
    result.push({
      target: tc,
      answer: ac,
      correct: tc !== null && ac !== null && tc === ac,
    });
  }

  return result;
}
