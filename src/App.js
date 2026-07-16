import { useState, useEffect, useRef, useCallback } from 'react';
import { MorsePlayer, getMorseTimings, buildMorseSequence } from './utils/morse';
import { getWord } from './utils/words';
import { scoreAnswer, getCharComparison } from './utils/scoring';
import {
  loadSettings, saveSettings, saveSession, loadHistory,
  saveMissed, loadMissed, removeMissed, recordAttempt,
  loadDailyStats, getPersonalBests
} from './utils/storage';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

const DEFAULT_SETTINGS = {
  mode: 'english',
  vocabulary: 'common',
  wpm: 15,
  farnsworth: false,
  minLen: 4,
  maxLen: 4,
  fontSize: 'medium',
};

const FONT_SIZES = {
  small: { base: '14px', input: '18px', display: '22px' },
  medium: { base: '16px', input: '22px', display: '28px' },
  large: { base: '19px', input: '28px', display: '36px' },
};

const player = new MorsePlayer();

export default function App() {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...loadSettings() }));
  const [tab, setTab] = useState('practice');
  const [currentWord, setCurrentWord] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [history, setHistory] = useState(() => loadHistory());
  const [missed, setMissed] = useState(() => loadMissed());
  const [dailyStats, setDailyStats] = useState(() => loadDailyStats());
  const [bests, setBests] = useState(() => getPersonalBests());
  const [savedThisWord, setSavedThisWord] = useState(false);
  const [replaySession, setReplaySession] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [wpmInput, setWpmInput] = useState(String(settings.wpm));
  const [minLenInput, setMinLenInput] = useState(String(settings.minLen));
  const [maxLenInput, setMaxLenInput] = useState(String(settings.maxLen));
  const [, setSessionLog] = useState([]);

  const answerRef = useRef(null);
  const fs = FONT_SIZES[settings.fontSize];

  useEffect(() => { saveSettings(settings); }, [settings]);

  const updateSetting = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const playWord = useCallback((word) => {
    if (!word) return;
    player.stop();
    setPlaying(true);
    player.unlock().then(() => {
      const timings = getMorseTimings(settings.wpm, settings.farnsworth);
      const seq = buildMorseSequence(word, timings);
      player.play(seq, 700, () => setPlaying(false));
    });
  }, [settings.wpm, settings.farnsworth]);

  const nextWord = useCallback((fromReplay = false) => {
    player.stop();
    setAnswer('');
    setSubmitted(false);
    setRevealed(false);
    setAttempts([]);
    setSavedThisWord(false);

    let word;
    if (fromReplay && replaySession) {
      const words = replaySession.words;
      const idx = replayIndex;
      word = words[idx];
      if (idx >= words.length - 1) {
        setReplaySession(null);
        setReplayIndex(0);
      } else {
        setReplayIndex(i => i + 1);
      }
    } else {
      word = getWord(settings.mode, settings.minLen, settings.maxLen, settings.vocabulary);
    }

    setCurrentWord(word);
    setTimeout(() => playWord(word), 150);
    answerRef.current?.focus();
  }, [settings, replaySession, replayIndex, playWord]);

  const replayCurrentWord = useCallback(() => {
    if (currentWord) {
      player.unlock().then(() => playWord(currentWord));
    }
  }, [currentWord, playWord]);

  useEffect(() => {
    const handler = (e) => {
      if (e.code === 'Space' && document.activeElement !== answerRef.current) {
        e.preventDefault();
        replayCurrentWord();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [replayCurrentWord]);

  useEffect(() => {
    nextWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    const s = scoreAnswer(currentWord, answer);
    setSubmitted(true);
    setAttempts(prev => [...prev, { answer, score: s }]);
    recordAttempt(settings.wpm, s);
    setDailyStats(loadDailyStats());
    setBests(getPersonalBests());
  };

  const handleResubmit = () => {
    if (!answer.trim()) return;
    const s = scoreAnswer(currentWord, answer);
    setAttempts(prev => [...prev, { answer, score: s }]);
    recordAttempt(settings.wpm, s);
    setDailyStats(loadDailyStats());
    setBests(getPersonalBests());
  };

  const handleNext = () => {
    if (currentWord && attempts.length > 0) {
      const bestScore = Math.max(...attempts.map(a => a.score));
      const entry = {
        word: currentWord,
        mode: settings.mode,
        wpm: settings.wpm,
        attempts: attempts.length,
        bestScore,
        timestamp: Date.now(),
      };
      setSessionLog(prev => {
        const updated = [...prev, entry];
        if (updated.length % 5 === 0) {
          saveSession({ words: updated.map(w => w.word), entries: updated });
          setHistory(loadHistory());
        }
        return updated;
      });
    }
    nextWord(!!replaySession);
  };

  const handleSaveMissed = () => {
    saveMissed(currentWord, settings.mode);
    setMissed(loadMissed());
    setSavedThisWord(true);
  };

  const handleRemoveMissed = (word) => {
    removeMissed(word);
    setMissed(loadMissed());
  };

  const handleReplaySession = (session) => {
    setReplaySession(session);
    setReplayIndex(0);
    setTab('practice');
    nextWord(false);
  };

  const handleReplayMissed = () => {
    const words = missed.map(m => m.word);
    if (!words.length) return;
    setReplaySession({ words, entries: [] });
    setReplayIndex(0);
    setTab('practice');
    setTimeout(() => nextWord(false), 50);
  };

  const handleWpmChange = (val) => {
    setWpmInput(val);
    const n = parseInt(val);
    if (!isNaN(n) && n >= 5 && n <= 50) updateSetting('wpm', n);
  };

  const handleLenChange = (which, val) => {
    if (which === 'min') setMinLenInput(val);
    else setMaxLenInput(val);
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= 20) {
      if (which === 'min') {
        updateSetting('minLen', n);
        if (n > settings.maxLen) updateSetting('maxLen', n);
      } else {
        updateSetting('maxLen', n);
        if (n < settings.minLen) updateSetting('minLen', n);
      }
    }
  };

  const chartData = dailyStats.slice(-30).map(s => ({
    date: s.date.slice(5),
    accuracy: Math.round(s.avgAccuracy),
    wpm: s.wpm,
  }));

  const lastScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;
  const comparison = revealed && currentWord && attempts.length > 0
    ? getCharComparison(currentWord, attempts[attempts.length - 1].answer)
    : null;

  return (
    <div className="app" style={{ fontSize: fs.base }}>
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-morse">· · · — — — · · ·</span>
            <h1>Morse Trainer</h1>
          </div>
          <div className="header-stats">
            <span>Best WPM: <strong>{bests.wpm}</strong></span>
            <span>Best Accuracy: <strong>{Math.round(bests.accuracy)}%</strong></span>
          </div>
        </div>
        <nav className="tabs">
          {['practice','progress','history','missed'].map(t => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'missed' && missed.length > 0 && (
                <span className="badge">{missed.length}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        {tab === 'practice' && (
          <div className="practice-panel">
            <div className="settings-bar">
              <div className="setting-group">
                <label>Mode</label>
                <select value={settings.mode} onChange={e => updateSetting('mode', e.target.value)}>
                  <option value="english">English words</option>
                  <option value="random">Random letters</option>
                  <option value="callsign">Callsigns</option>
                </select>
              </div>

              {settings.mode === 'english' && (
                <div className="setting-group">
                  <label>Vocabulary</label>
                  <select value={settings.vocabulary} onChange={e => updateSetting('vocabulary', e.target.value)}>
                    <option value="common">Common words</option>
                    <option value="ham">Ham radio</option>
                  </select>
                </div>
              )}

              <div className="setting-group">
                <label>WPM</label>
                <input
                  type="number" min="5" max="50"
                  value={wpmInput}
                  onChange={e => handleWpmChange(e.target.value)}
                  className="num-input"
                />
              </div>

              {settings.mode !== 'callsign' && settings.mode !== 'random' && (
                <div className="setting-group">
                  <label>Word length</label>
                  <div className="len-inputs">
                    <input
                      type="number" min="1" max="20"
                      value={minLenInput}
                      onChange={e => handleLenChange('min', e.target.value)}
                      className="num-input small"
                      placeholder="min"
                    />
                    <span className="len-sep">–</span>
                    <input
                      type="number" min="1" max="20"
                      value={maxLenInput}
                      onChange={e => handleLenChange('max', e.target.value)}
                      className="num-input small"
                      placeholder="max"
                    />
                  </div>
                </div>
              )}

              <div className="setting-group toggle-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.farnsworth}
                    onChange={e => updateSetting('farnsworth', e.target.checked)}
                  />
                  Farnsworth
                </label>
              </div>

              <div className="setting-group">
                <label>Text size</label>
                <select value={settings.fontSize} onChange={e => updateSetting('fontSize', e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            <div className="practice-area">
              {replaySession && (
                <div className="replay-banner">
                  Replaying saved session — word {replayIndex} of {replaySession.words.length}
                </div>
              )}

              <div className="playback-controls">
                <button
                  className={`btn-primary play-btn${playing ? ' playing' : ''}`}
                  onClick={replayCurrentWord}
                  disabled={playing}
                >
                  {playing ? (
                    <><span className="spin">⚙</span> Playing…</>
                  ) : (
                    <>▶ Replay <span className="shortcut">[Space]</span></>
                  )}
                </button>
              </div>

              {lastScore !== null && (
                <div className={`score-display ${lastScore >= 80 ? 'good' : lastScore >= 50 ? 'ok' : 'poor'}`}
                  style={{ fontSize: fs.display }}
                >
                  {lastScore}%
                  {attempts.length > 1 && (
                    <span className="attempt-count"> (attempt {attempts.length})</span>
                  )}
                </div>
              )}

              <div className="answer-section">
                <input
                  ref={answerRef}
                  type="text"
                  value={answer}
                  onChange={e => setAnswer(e.target.value.toUpperCase())}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      submitted ? handleResubmit() : handleSubmit();
                    }
                  }}
                  placeholder="Type what you heard…"
                  className="answer-input"
                  style={{ fontSize: fs.input }}
                  autoCapitalize="characters"
                  spellCheck={false}
                />
                <div className="answer-buttons">
                  {!submitted ? (
                    <button className="btn-primary" onClick={handleSubmit}>Submit</button>
                  ) : (
                    <button className="btn-secondary" onClick={handleResubmit}>Try again</button>
                  )}
                  <button className="btn-primary next-btn" onClick={handleNext}>
                    Next →
                  </button>
                </div>
              </div>

              {submitted && (
                <div className="reveal-row">
                  {!revealed ? (
                    <button className="btn-ghost" onClick={() => setRevealed(true)}>
                      Reveal answer
                    </button>
                  ) : (
                    <div className="reveal-section">
                      <div className="char-comparison" style={{ fontSize: fs.input }}>
                        {comparison && comparison.map((c, i) => (
                          <span key={i} className={`char-cell ${c.correct ? 'correct' : 'wrong'}`}>
                            <span className="char-target">{c.target || '·'}</span>
                            <span className="char-answer">{c.answer || '·'}</span>
                          </span>
                        ))}
                      </div>
                      <div className="full-word" style={{ fontSize: fs.display }}>
                        {currentWord}
                      </div>
                    </div>
                  )}

                  {lastScore !== null && lastScore < 100 && !savedThisWord && (
                    <button className="btn-ghost save-btn" onClick={handleSaveMissed}>
                      ★ Save to missed words
                    </button>
                  )}
                  {savedThisWord && <span className="saved-label">✓ Saved</span>}
                </div>
              )}

              {attempts.length > 1 && (
                <div className="attempt-history">
                  <span className="attempt-label">Attempts:</span>
                  {attempts.map((a, i) => (
                    <span key={i} className={`attempt-chip ${a.score >= 80 ? 'good' : a.score >= 50 ? 'ok' : 'poor'}`}>
                      {a.score}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'progress' && (
          <div className="progress-panel">
            <h2>Progress</h2>
            <div className="bests-row">
              <div className="best-card">
                <span className="best-label">Personal best WPM</span>
                <span className="best-val">{bests.wpm}</span>
              </div>
              <div className="best-card">
                <span className="best-label">Personal best accuracy</span>
                <span className="best-val">{Math.round(bests.accuracy)}%</span>
              </div>
            </div>
            {chartData.length > 1 ? (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontFamily: 'Special Elite, serif', fontSize: 12 }} />
                    <YAxis yAxisId="acc" domain={[0, 100]} tick={{ fontFamily: 'Special Elite, serif', fontSize: 12 }} />
                    <YAxis yAxisId="wpm" orientation="right" domain={[0, 55]} tick={{ fontFamily: 'Special Elite, serif', fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Special Elite, serif', background: '#f5f0e8', border: '1px solid #7a6e5f' }} />
                    <Legend wrapperStyle={{ fontFamily: 'Special Elite, serif' }} />
                    <Line yAxisId="acc" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#4a3f2f" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="wpm" type="monotone" dataKey="wpm" name="WPM" stroke="#8b5e3c" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="empty-state">Complete more sessions to see your progress chart.</p>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="history-panel">
            <h2>Past sessions</h2>
            {history.length === 0 ? (
              <p className="empty-state">No sessions recorded yet. Practice a few words to build your history.</p>
            ) : (
              <div className="session-list">
                {history.map((session, i) => (
                  <div key={i} className="session-card">
                    <div className="session-meta">
                      <span className="session-date">
                        {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="session-info">{session.words?.length || 0} words</span>
                    </div>
                    <div className="session-words">
                      {session.words?.slice(0, 8).join(' · ')}
                      {session.words?.length > 8 && ' …'}
                    </div>
                    <button className="btn-ghost small" onClick={() => handleReplaySession(session)}>
                      Replay session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'missed' && (
          <div className="missed-panel">
            <h2>Missed words</h2>
            {missed.length === 0 ? (
              <p className="empty-state">No missed words saved. When you struggle with a word, save it here for review.</p>
            ) : (
              <>
                <button className="btn-primary practice-missed-btn" onClick={handleReplayMissed}>
                  Practice all missed words
                </button>
                <div className="missed-list">
                  {missed.map((m, i) => (
                    <div key={i} className="missed-card">
                      <span className="missed-word">{m.word}</span>
                      <span className="missed-mode">{m.mode}</span>
                      <button className="btn-ghost small remove-btn" onClick={() => handleRemoveMissed(m.word)}>✕</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>700 Hz · Standard Morse · PARIS timing</span>
        {settings.farnsworth && <span> · Farnsworth spacing</span>}
      </footer>
    </div>
  );
}
