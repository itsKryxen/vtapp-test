'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'idle' | 'showing' | 'input' | 'round-complete' | 'won' | 'lost';
type Feedback = 'correct' | 'wrong' | null;

const GRID_SIZE = 16;
const MAX_ROUND = 6;
const MAX_ERRORS = 3;
const SESSION_SECONDS = 60;

function createSequence(length: number) {
  const sequence: number[] = [];

  while (sequence.length < length) {
    const node = Math.floor(Math.random() * GRID_SIZE);
    if (node !== sequence.at(-1)) sequence.push(node);
  }

  return sequence;
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
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameActive = phase === 'showing' || phase === 'input' || phase === 'round-complete';
  const accuracy = totalInputs === 0 ? 100 : Math.round((correctInputs / totalInputs) * 100);
  const timePercent = (timeLeft / SESSION_SECONDS) * 100;

  useEffect(() => {
    try {
      setBestScore(Number(window.localStorage.getItem('vtapp-signal-breach-best')) || 0);
    } catch {
      // Storage can be unavailable in private browsing; the game still works.
    }
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

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
      <div className="panel brackets scanlines relative overflow-hidden p-4 sm:p-7 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(179_40_33/.12),transparent_48%)]" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-400/70 shadow-[0_0_22px_rgb(224_104_94/.8)] motion-safe:animate-scan"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="mb-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
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

          <div className="mx-auto grid w-full max-w-[620px] grid-cols-4 gap-2 sm:gap-3" aria-label="Signal node grid">
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
          <div className="absolute inset-0 z-20 flex items-start justify-center bg-ink-950/88 p-6 pt-10 text-center backdrop-blur-sm sm:pt-14 lg:pt-16">
            <div className="max-w-md">
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
              <button type="button" onClick={startGame} className="btn-primary mt-7">
                {phase === 'idle' ? 'Initialize breach' : 'Run new breach'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-5">
        <div className="panel p-6">
          <div className="flex items-center gap-3">
            <span className={`inline-block h-2 w-2 ${gameActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="mono-label text-slate-400">Live terminal</span>
          </div>
          <p className="mt-5 min-h-12 font-mono text-xs leading-relaxed text-white" aria-live="polite">
            <span className="text-brand-400">&gt; </span>{status}
          </p>
        </div>

        <div className="panel p-6">
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

        <div className="panel p-6">
          <div className="mono-label text-slate-400">Layer progress</div>
          <div className="mt-5 grid grid-cols-6 gap-2">
            {Array.from({ length: MAX_ROUND }, (_, index) => {
              const layer = index + 1;
              const complete = layer < round || phase === 'won';
              const current = layer === round && phase !== 'won';
              return (
                <span
                  key={layer}
                  className={`grid aspect-square place-items-center border font-mono text-[9px] ${complete ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300' : current ? 'border-brand-400 bg-brand-600/15 text-brand-400' : 'border-white/10 text-slate-600'}`}
                >
                  {String(layer).padStart(2, '0')}
                </span>
              );
            })}
          </div>
        </div>

        <div className="panel p-6">
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
    <div className="bg-ink-900/90 px-4 py-3">
      <div className="mono-label">{label}</div>
      <div className="mt-2 font-mono text-sm text-white sm:text-base">{value}</div>
    </div>
  );
}
