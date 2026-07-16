# Morse Trainer

A 1940s typewriter-aesthetic web app for learning Morse code by ear.

## Features

- Three modes: English words, random letter sequences, callsigns
- Adjustable WPM (5–50), number input with selector
- Farnsworth timing toggle (gaps stretch, characters stay at speed)
- Replay button + Space bar shortcut
- Immediate % accuracy scoring with character-by-character reveal
- Multiple attempts per word — all logged to daily stats
- Save missed words for later review and replay
- Progress chart: daily WPM & accuracy over 30 days
- Session history — replay past sessions
- Mobile-friendly, 1940s typewriter aesthetic

## Quick Start

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub + Vercel Dashboard

1. Push this folder to your GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects the React app — click **Deploy**

No environment variables needed. All data is stored locally in the browser.

## Project Structure

```
src/
  App.js          — Main application component
  App.css         — Typewriter aesthetic styles
  utils/
    morse.js      — Morse code table, timing engine, Web Audio player
    words.js      — Word lists (common English, ham radio, callsign generator)
    scoring.js    — Answer scoring and character comparison
    storage.js    — LocalStorage: sessions, missed words, daily stats
```

## Morse Timing

Uses PARIS standard timing:
- Dot = 1 unit
- Dash = 3 units
- Intra-character gap = 1 unit
- Inter-character gap = 3 units
- Word gap = 7 units

At WPM `n`, dot duration = `1200 / n` ms.

Farnsworth mode: characters play at 18 WPM; gaps stretch to achieve target overall WPM.

## Audio

Web Audio API only — no external audio files. Pure 700 Hz sine wave with short attack/release ramps to prevent clicks.

## Data Storage

All data lives in `localStorage` and is automatically pruned after 30 days. No accounts, no server, no network required after initial load.
