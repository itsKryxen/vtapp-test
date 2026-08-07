'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'idle' | 'showing' | 'input' | 'round-complete' | 'won' | 'lost';
type Feedback = 'correct' | 'wrong' | null;

const GRID_SIZE = 16;
const MAX_ROUND = 6;
const MAX_ERRORS = 3;
const SESSION_SECONDS = 60;
const ACHIEVEMENT_KEY = 'vtapp-signal-breach-achievement';

type ClearanceDetails = {
  name: string;
  score: number;
  accuracy: number;
  completedAt: string;
  clearanceId: string;
};

function createSequence(length: number) {
  const sequence: number[] = [];

  while (sequence.length < length) {
    const node = Math.floor(Math.random() * GRID_SIZE);
    if (node !== sequence.at(-1)) sequence.push(node);
  }

  return sequence;
}

function createClearanceId(name: string, score: number, completedAt: string) {
  const source = `${name}|${score}|${completedAt}`;
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `SB-${Math.abs(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

function fitCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number) {
  let size = startSize;
  while (size > 42) {
    context.font = `600 ${size}px Arial, sans-serif`;
    if (context.measureText(text).width <= maxWidth) return;
    size -= 4;
  }
}

function buildClearanceCard(details: ClearanceDetails) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');

  const isLight = document.documentElement.classList.contains('light');
  const cPrimary = isLight ? '#00e5ff' : '#b32821';
  const cBright = isLight ? '#08c2d6' : '#e0685e';
  const cLight = isLight ? '#00ff9d' : '#ee9c95';
  const cBg = isLight ? '#f7f9fc' : '#08090c';
  const cText = isLight ? '#141c24' : '#ffffff';
  const cTextMuted = isLight ? '#506580' : '#8c929e';

  context.fillStyle = cBg;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(255,255,255,.055)';
  context.lineWidth = 1;
  for (let x = 80; x < canvas.width; x += 80) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 60; y < canvas.height; y += 60) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  const glow = context.createRadialGradient(1320, 160, 10, 1320, 160, 520);
  const glowRGB = isLight ? '0,229,255' : '179,40,33';
  glow.addColorStop(0, `rgba(${glowRGB},.42)`);
  glow.addColorStop(1, `rgba(${glowRGB},0)`);
  context.fillStyle = glow;
  context.fillRect(800, 0, 800, 700);

  context.fillStyle = cPrimary;
  context.fillRect(0, 0, 24, canvas.height);
  context.fillRect(96, 92, 86, 8);

  context.fillStyle = cBright;
  context.font = '700 25px ui-monospace, monospace';
  context.letterSpacing = '5px';
  context.fillText('V-TAPP 2026 // SIGNAL BREACH', 210, 108);

  context.fillStyle = cText;
  context.font = '300 70px Arial, sans-serif';
  context.letterSpacing = '0px';
  context.fillText('CLEARANCE VERIFIED', 96, 220);

  context.fillStyle = cTextMuted;
  context.font = '500 21px ui-monospace, monospace';
  context.letterSpacing = '4px';
  context.fillText('THIS DIGITAL ACHIEVEMENT IS PRESENTED TO', 100, 305);

  const displayName = details.name.toUpperCase();
  context.fillStyle = cText;
  fitCanvasText(context, displayName, 1370, 92);
  context.letterSpacing = '-2px';
  context.fillText(displayName, 96, 410);

  context.strokeStyle = isLight ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.16)';
  context.strokeRect(96, 478, 1408, 210);
  context.beginPath();
  context.moveTo(565, 478);
  context.lineTo(565, 688);
  context.moveTo(1034, 478);
  context.lineTo(1034, 688);
  context.stroke();

  const stats = [
    ['FINAL SCORE', String(details.score).padStart(5, '0')],
    ['ACCURACY', `${details.accuracy}%`],
    ['LAYERS CLEARED', '06 / 06'],
  ];
  stats.forEach(([label, value], index) => {
    const x = 130 + index * 469;
    context.fillStyle = cTextMuted;
    context.font = '600 18px ui-monospace, monospace';
    context.letterSpacing = '4px';
    context.fillText(label, x, 544);
    context.fillStyle = index === 1 ? cLight : cText;
    context.font = '500 55px ui-monospace, monospace';
    context.letterSpacing = '1px';
    context.fillText(value, x, 625);
  });

  const completed = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(details.completedAt));

  context.fillStyle = cBright;
  context.font = '700 18px ui-monospace, monospace';
  context.letterSpacing = '3px';
  context.fillText(details.clearanceId, 96, 775);
  context.fillStyle = cTextMuted;
  context.font = '500 18px ui-monospace, monospace';
  context.letterSpacing = '2px';
  context.fillText(`COMPLETED ${completed.toUpperCase()} IST`, 96, 814);

  context.textAlign = 'right';
  context.fillStyle = cText;
  context.font = '700 28px Arial, sans-serif';
  context.letterSpacing = '1px';
  context.fillText('ACCESS GRANTED', 1504, 775);
  context.fillStyle = cTextMuted;
  context.font = '500 16px ui-monospace, monospace';
  context.letterSpacing = '2px';
  context.fillText('DIGITAL MINI-GAME ACHIEVEMENT', 1504, 814);
  context.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the card.'))), 'image/png');
  });
}

export default function SignalBreachGame() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [feedbackNode, setFeedbackNode] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [correctInputs, setCorrectInputs] = useState(0);
  const [totalInputs, setTotalInputs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SESSION_SECONDS);
  const [status, setStatus] = useState('Ready for neural handshake.');
  const [playerName, setPlayerName] = useState('');
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [rewardStatus, setRewardStatus] = useState('');
  const [canShare, setCanShare] = useState(false);
  const [savedAchievement, setSavedAchievement] = useState<ClearanceDetails | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameActive = phase === 'showing' || phase === 'input' || phase === 'round-complete';
  const accuracy = totalInputs === 0 ? 100 : Math.round((correctInputs / totalInputs) * 100);
  const timePercent = (timeLeft / SESSION_SECONDS) * 100;

  useEffect(() => {
    try {
      setBestScore(Number(window.localStorage.getItem('vtapp-signal-breach-best')) || 0);
      const saved = window.localStorage.getItem(ACHIEVEMENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ClearanceDetails>;
        if (
          typeof parsed.name === 'string'
          && typeof parsed.score === 'number'
          && typeof parsed.accuracy === 'number'
          && typeof parsed.completedAt === 'string'
          && typeof parsed.clearanceId === 'string'
        ) {
          setSavedAchievement(parsed as ClearanceDetails);
        }
      }
    } catch {
      // Storage can be unavailable in private browsing; the game still works.
    }
    setCanShare(typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (phase !== 'won' && phase !== 'lost') return;

    setBestScore((current) => {
      const next = Math.max(current, score);
      try {
        window.localStorage.setItem('vtapp-signal-breach-best', String(next));
      } catch {
        // Keep the in-memory best score when storage is unavailable.
      }
      return next;
    });
  }, [phase, score]);

  useEffect(() => {
    if (!gameActive) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive || timeLeft > 0) return;
    setPhase('lost');
    setStatus('Signal expired. The firewall restored itself.');
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) return;

    const timers: number[] = [];
    setActiveNode(null);
    setFeedbackNode(null);
    setFeedback(null);
    setStatus(`Receiving round ${round} signal. Observe the nodes.`);

    sequence.forEach((node, index) => {
      const start = 350 + index * 620;
      timers.push(window.setTimeout(() => setActiveNode(node), start));
      timers.push(window.setTimeout(() => setActiveNode(null), start + 390));
    });

    timers.push(
      window.setTimeout(() => {
        setActiveNode(null);
        setPhase('input');
        setStatus('Sequence locked. Repeat the signal.');
      }, 350 + sequence.length * 620),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [phase, round, sequence]);

  useEffect(() => {
    if (phase !== 'round-complete') return;

    const timer = window.setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      setSequence(createSequence(nextRound + 2));
      setInputIndex(0);
      setPhase('showing');
    }, 900);

    return () => window.clearTimeout(timer);
  }, [phase, round]);

  useEffect(
    () => () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    },
    [],
  );

  const nodeLabels = useMemo(
    () => Array.from({ length: GRID_SIZE }, (_, index) => String(index + 1).padStart(2, '0')),
    [],
  );

  function startGame() {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setRound(1);
    setSequence(createSequence(3));
    setActiveNode(null);
    setFeedbackNode(null);
    setFeedback(null);
    setInputIndex(0);
    setScore(0);
    setErrors(0);
    setCorrectInputs(0);
    setTotalInputs(0);
    setTimeLeft(SESSION_SECONDS);
    setPlayerName('');
    setCompletedAt(null);
    setRewardStatus('');
    setStatus('Handshake accepted. Receiving first signal.');
    setPhase('showing');
  }

  function showFeedback(node: number, kind: Exclude<Feedback, null>) {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setFeedbackNode(node);
    setFeedback(kind);
    pressTimer.current = setTimeout(() => {
      setFeedbackNode(null);
      setFeedback(null);
    }, 320);
  }

  function selectNode(node: number) {
    if (phase !== 'input') return;

    const expectedNode = sequence[inputIndex];
    setTotalInputs((current) => current + 1);

    if (node !== expectedNode) {
      const nextErrors = errors + 1;
      showFeedback(node, 'wrong');
      setErrors(nextErrors);
      setScore((current) => Math.max(0, current - 25));
      setInputIndex(0);

      if (nextErrors >= MAX_ERRORS) {
        setStatus('Intrusion detected. Three signal mismatches recorded.');
        setPhase('lost');
      } else {
        setStatus(`Signal mismatch. Sequence reset; ${MAX_ERRORS - nextErrors} attempt${MAX_ERRORS - nextErrors === 1 ? '' : 's'} remain.`);
      }
      return;
    }

    showFeedback(node, 'correct');
    setCorrectInputs((current) => current + 1);
    setScore((current) => current + round * 10);

    if (inputIndex !== sequence.length - 1) {
      setInputIndex((current) => current + 1);
      setStatus(`Signal matched // ${inputIndex + 1} of ${sequence.length}.`);
      return;
    }

    setScore((current) => current + round * 100 + timeLeft);
    setInputIndex(0);

    if (round === MAX_ROUND) {
      setCompletedAt(new Date().toISOString());
      setStatus('All security layers synchronized. Access granted.');
      setPhase('won');
    } else {
      setStatus(`Round ${round} decrypted. Preparing the next layer.`);
      setPhase('round-complete');
    }
  }

  function replaySequence() {
    if (phase !== 'input') return;
    setScore((current) => Math.max(0, current - 50));
    setInputIndex(0);
    setStatus('Replay requested. Signal trace costs 50 points.');
    setPhase('showing');
  }

  function getClearanceDetails() {
    const name = playerName.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!name || !completedAt) return null;

    return {
      name,
      score,
      accuracy,
      completedAt,
      clearanceId: createClearanceId(name, score, completedAt),
    } satisfies ClearanceDetails;
  }

  function saveAchievement(details: ClearanceDetails) {
    setSavedAchievement(details);
    try {
      window.localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(details));
    } catch {
      // The image reward still works when browser storage is unavailable.
    }
  }

  async function getReward() {
    const details = getClearanceDetails();
    if (!details) return;

    setRewardStatus('Preparing your clearance card…');
    try {
      const blob = await buildClearanceCard(details);
      saveAchievement(details);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `signal-breach-${details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'clearance'}.png`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setRewardStatus('Achievement saved. Clearance card downloaded.');
    } catch {
      setRewardStatus('The card could not be created on this device. Please try again.');
    }
  }

  async function shareReward() {
    const details = getClearanceDetails();
    if (!details) return;

    setRewardStatus('Preparing your clearance card…');
    try {
      const blob = await buildClearanceCard(details);
      const file = new File([blob], 'signal-breach-clearance.png', { type: 'image/png' });
      if (!navigator.canShare?.({ files: [file] })) {
        setRewardStatus('Image sharing is unavailable here. You can download the card instead.');
        return;
      }
      await navigator.share({
        title: 'V-TAPP 2026 Signal Breach',
        text: `I cleared all six Signal Breach layers with ${score} points and ${accuracy}% accuracy.`,
        files: [file],
      });
      saveAchievement(details);
      setRewardStatus('Achievement saved. Clearance card shared.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setRewardStatus('Share cancelled. Your card is still ready to download.');
      } else {
        setRewardStatus('Sharing is unavailable right now. You can download the card instead.');
      }
    }
  }

  return (
    <section className="grid gap-3 lg:gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
      <div className="panel brackets scanlines relative overflow-hidden p-3 sm:p-5 lg:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(179_40_33/.12),transparent_48%)]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-400/70 shadow-[0_0_22px_rgb(224_104_94/.8)] motion-safe:animate-scan"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-5 grid grid-cols-2 gap-px border border-white/30 bg-white/10 sm:grid-cols-4">
            <Readout label="Round" value={`${String(round).padStart(2, '0')} / 06`} />
            <Readout label="Score" value={String(score).padStart(5, '0')} />
            <Readout label="Accuracy" value={`${accuracy}%`} />
            <Readout label="Best" value={String(bestScore).padStart(5, '0')} />
          </div>

          <div className="mb-5 flex items-center gap-4">
            <span className="mono-label shrink-0">Session timer</span>
            <div className="h-1 flex-1 overflow-hidden bg-white/10">
              <div
                className={`h-full transition-[width] duration-300 ${timeLeft <= 10 ? 'bg-rose-500' : 'bg-brand-500'}`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
            <span className={`w-12 text-right font-mono text-xs ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
              {String(timeLeft).padStart(2, '0')}s
            </span>
          </div>

          <div className="mx-auto grid w-full max-w-[min(100%,400px,40vh)] lg:max-w-[min(100%,480px,50vh)] grid-cols-4 gap-2 sm:gap-3" aria-label="Signal node grid">
            {nodeLabels.map((label, node) => {
              const isSignal = activeNode === node;
              const isCorrect = feedbackNode === node && feedback === 'correct';
              const isWrong = feedbackNode === node && feedback === 'wrong';

              return (
                <button
                  key={label}
                  type="button"
                  disabled={phase !== 'input'}
                  onClick={() => selectNode(node)}
                  aria-label={`Signal node ${node + 1}`}
                  className={`group relative aspect-square overflow-hidden border font-mono text-xs tracking-label transition-all duration-150 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:text-sm ${
                    isSignal
                      ? 'border-brand-300 bg-brand-500 text-white shadow-[0_0_30px_rgb(179_40_33/.75),inset_0_0_24px_rgb(255_255_255/.12)] scale-[1.035]'
                      : isCorrect
                        ? 'border-emerald-300 bg-emerald-500/30 text-emerald-200 shadow-[0_0_24px_rgb(var(--em-500)/.45)]'
                        : isWrong
                          ? 'border-rose-400 bg-rose-500/30 text-rose-200'
                          : phase === 'input'
                            ? 'border-white/15 bg-ink-900/80 text-slate-400 hover:border-brand-400 hover:bg-brand-600/10 hover:text-white'
                            : 'border-white/[0.07] bg-ink-900/50 text-slate-700'
                  }`}
                >
                  <span className="absolute left-2 top-2 text-[8px] text-current opacity-60 sm:text-[9px]">N_{label}</span>
                  <span className="absolute inset-3 border border-current opacity-[0.07] transition-opacity group-hover:opacity-20" />
                  <span className="text-base sm:text-xl">{isSignal ? '◆' : '◇'}</span>
                </button>
              );
            })}
          </div>

          <p className="sr-only" aria-live="polite">{status}</p>
        </div>

        {(phase === 'idle' || phase === 'won' || phase === 'lost') && (
          <div className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto bg-ink-950/88 p-6 pt-10 text-center backdrop-blur-sm sm:pt-14 lg:pt-16">
            <div className="max-w-lg">
              <div className={`mx-auto mb-6 grid h-16 w-16 place-items-center border font-mono text-xl ${phase === 'won' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300' : phase === 'lost' ? 'border-rose-400 bg-rose-500/10 text-rose-300' : 'border-brand-400 bg-brand-600/10 text-brand-400'}`}>
                {phase === 'won' ? '✓' : phase === 'lost' ? '×' : '◇'}
              </div>
              <div className="mono-label text-brand-400">
                {phase === 'idle' ? 'BREACH TERMINAL // STANDBY' : phase === 'won' ? 'CLEARANCE // VERIFIED' : 'CLEARANCE // REJECTED'}
              </div>
              <h2 className="mt-4 font-display text-3xl font-light text-white sm:text-5xl">
                {phase === 'idle' ? 'Memorize. Repeat. Breach.' : phase === 'won' ? 'Access granted' : 'Access denied'}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                {phase === 'idle'
                  ? 'Observe each glowing node, then reproduce the exact sequence. Decrypt six layers before the signal expires.'
                  : `${status} Final score: ${score}. Accuracy: ${accuracy}%.`}
              </p>
              {phase === 'idle' && savedAchievement && (
                <div className="mx-auto mt-5 max-w-sm border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-left">
                  <div className="font-mono text-[9px] uppercase tracking-label text-emerald-300">
                    ✓ Clearance badge unlocked
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-400">
                    <span className="truncate text-white">{savedAchievement.name}</span>
                    <span className="shrink-0 font-mono">{savedAchievement.score} pts</span>
                  </div>
                </div>
              )}
              {phase === 'won' ? (
                <div className="mx-auto mt-6 max-w-sm">
                  <div className="border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 font-mono text-[10px] uppercase tracking-label text-emerald-300">
                    Achievement unlocked // Clearance card
                  </div>
                  <label htmlFor="clearance-name" className="mono-label mt-5 block text-left text-slate-400">
                    Name on your card
                  </label>
                  <input
                    id="clearance-name"
                    type="text"
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value.slice(0, 40))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') void getReward();
                    }}
                    maxLength={40}
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="mt-2 w-full border border-white/15 bg-ink-900 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-brand-400"
                  />
                  <p className="mt-2 text-left font-mono text-[9px] leading-relaxed text-slate-600">
                    Your name stays on this device and is only used to create the image.
                  </p>
                  <button
                    type="button"
                    onClick={() => void getReward()}
                    disabled={!playerName.trim()}
                    className="btn-primary mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Download clearance card <span aria-hidden="true">↓</span>
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={() => void shareReward()}
                      disabled={!playerName.trim()}
                      className="btn-ghost mt-3 w-full disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Share clearance card <span aria-hidden="true">↗</span>
                    </button>
                  )}
                  {rewardStatus && <p className="mt-3 font-mono text-[10px] text-slate-400" aria-live="polite">{rewardStatus}</p>}
                  <button type="button" onClick={startGame} className="btn-ghost mt-4 w-full">
                    Run new breach
                  </button>
                </div>
              ) : (
                <button type="button" onClick={startGame} className="btn-primary mt-7">
                  {phase === 'idle' ? 'Initialize breach' : 'Run new breach'}
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-5">
        <div className="panel p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-2 w-2 ${gameActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="mono-label text-slate-400">Live terminal</span>
          </div>
          <p className="mt-5 min-h-12 font-mono text-xs leading-relaxed text-white" aria-live="polite">
            <span className="text-brand-400">&gt; </span>{status}
          </p>
        </div>

        <div className="panel p-4 sm:p-5">
          <div className="mono-label text-slate-400">Breach integrity</div>
          <div className="mt-5 flex gap-2" aria-label={`${MAX_ERRORS - errors} attempts remaining`}>
            {Array.from({ length: MAX_ERRORS }, (_, index) => (
              <span
                key={index}
                className={`h-3 flex-1 border ${index < errors ? 'border-rose-500 bg-rose-500/70' : 'border-emerald-400/50 bg-emerald-500/20'}`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between font-mono text-[9px] uppercase tracking-label text-slate-600">
            <span>{errors} mismatches</span>
            <span>{MAX_ERRORS - errors} remaining</span>
          </div>
        </div>

        <div className="panel p-4 sm:p-5">
          <div className="mono-label text-slate-400">Layer progress</div>
          <div className="mt-5 grid grid-cols-6 gap-2">
            {Array.from({ length: MAX_ROUND }, (_, index) => {
              const layer = index + 1;
              const complete = layer < round || phase === 'won';
              const current = layer === round && phase !== 'won';
              return (
                <span
                  key={layer}
                  className={`grid aspect-square place-items-center border font-mono text-[9px] ${complete ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300' : current ? 'border-brand-400 bg-brand-600/15 text-brand-400' : 'border-white/30 text-slate-600'}`}
                >
                  {String(layer).padStart(2, '0')}
                </span>
              );
            })}
          </div>
        </div>

        <div className="panel p-4 sm:p-5">
          <div className="mono-label text-slate-400">Protocol</div>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-slate-400">
            <li className="flex gap-3"><span className="font-mono text-[10px] text-brand-400">01</span>Watch the full node sequence.</li>
            <li className="flex gap-3"><span className="font-mono text-[10px] text-brand-400">02</span>Repeat it using touch, pointer, or keyboard.</li>
            <li className="flex gap-3"><span className="font-mono text-[10px] text-brand-400">03</span>Clear six layers before time reaches zero.</li>
          </ol>

          <button
            type="button"
            onClick={replaySequence}
            disabled={phase !== 'input'}
            className="btn-ghost mt-6 w-full disabled:cursor-not-allowed disabled:opacity-30"
          >
            Replay signal · −50
          </button>
        </div>
      </aside>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-900/90 px-2 py-2 sm:px-4 sm:py-3 text-center sm:text-left">
      <div className="mono-label text-[9px] sm:text-[10px]">{label}</div>
      <div className="mt-1 sm:mt-2 font-mono text-xs sm:text-base text-white">{value}</div>
    </div>
  );
}
