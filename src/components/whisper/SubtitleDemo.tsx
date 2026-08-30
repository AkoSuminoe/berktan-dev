'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { Upload, Download, Copy, Check, RotateCcw, Cpu } from 'lucide-react';
import Turnstile, {
  TURNSTILE_SITE_KEY,
  type TurnstileHandle,
} from '@/components/Turnstile';
import {
  WHISPER_API_BASE,
  WHISPER_ACCEPT,
  WHISPER_POLL_MS,
  formatBytes,
  formatClock,
  type JobStatus,
  type WhisperHealth,
  type WhisperLanguage,
  type WhisperLimits,
} from '@/lib/whisper';

/*
 * Live demo of the Whisper subtitle service.
 *
 * The logic here is carried over unchanged from the reference component in the
 * whisper-subtitle-generator repository: the upload, the one-second poll, the
 * phase machine, the Turnstile handling and the SRT fetch all work and were
 * not worth redesigning. Only the presentation is new, so the demo speaks the
 * same visual language as the rest of the site rather than arriving as a
 * second design system bolted on.
 */

type Phase = 'idle' | 'uploading' | 'working' | 'done' | 'error';

const LANGUAGES: { code: WhisperLanguage; label: string }[] = [
  { code: 'tr', label: 'Turkish' },
  { code: 'en', label: 'English' },
];

export default function SubtitleDemo() {
  const reduce = useReducedMotion();

  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<WhisperLanguage>('tr');
  const [phase, setPhase] = useState<Phase>('idle');
  const [uploadPct, setUploadPct] = useState(0);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [srt, setSrt] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');
  const [limits, setLimits] = useState<WhisperLimits | null>(null);
  const [health, setHealth] = useState<WhisperHealth | null>(null);
  const [termsText, setTermsText] = useState('');
  const [termsError, setTermsError] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const aliveRef = useRef(true);
  const captchaRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (pollRef.current) clearTimeout(pollRef.current);
      xhrRef.current?.abort();
    };
  }, []);

  /* Advertise the server's real limits rather than hard-coding them here. */
  useEffect(() => {
    fetch(`${WHISPER_API_BASE}/api/health`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WhisperHealth | null) => {
        if (!aliveRef.current || !data) return;
        setHealth(data);
        setLimits(data.limits);
      })
      .catch(() => undefined);
  }, []);

  const onTermsChange = useCallback((value: string) => {
    setTermsText(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setTermsError('');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setTermsError('Must be an object, like {"wrong": "correct"}.');
        return;
      }
      const bad = Object.entries(parsed as Record<string, unknown>).find(
        ([, value]) => typeof value !== 'string',
      );
      setTermsError(bad ? `"${bad[0]}" must map to text.` : '');
    } catch {
      setTermsError('Not valid JSON yet.');
    }
  }, []);

  const reset = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    xhrRef.current?.abort();
    setPhase('idle');
    setUploadPct(0);
    setJob(null);
    setSrt('');
    setError('');
    setCopied(false);
    setTermsText('');
    setTermsError('');
  }, []);

  const selectFile = useCallback(
    (next: File | null) => {
      if (next && limits && next.size > limits.max_upload_mb * 1024 * 1024) {
        setError(`That file is too large. The limit is ${limits.max_upload_mb} MB.`);
        return;
      }
      reset();
      setFile(next);
    },
    [reset, limits]
  );

  const poll = useCallback(async (id: string) => {
    if (!aliveRef.current) return;
    try {
      const res = await fetch(`${WHISPER_API_BASE}/api/jobs/${id}`);
      if (!res.ok) throw new Error(`Job lookup failed (${res.status})`);
      const status: JobStatus = await res.json();
      if (!aliveRef.current) return;
      setJob(status);

      if (status.status === 'error') {
        setError(status.error || 'Transcription failed.');
        setPhase('error');
        return;
      }
      if (status.status === 'done') {
        const srtRes = await fetch(`${WHISPER_API_BASE}/api/jobs/${id}/srt`);
        if (!srtRes.ok) throw new Error(`Could not fetch the SRT (${srtRes.status})`);
        const text = await srtRes.text();
        if (!aliveRef.current) return;
        setSrt(text);
        setPhase('done');
        return;
      }
      pollRef.current = setTimeout(() => poll(id), WHISPER_POLL_MS);
    } catch (err) {
      if (!aliveRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, []);

  const start = useCallback(() => {
    if (!file) return;
    if (TURNSTILE_SITE_KEY && !token) {
      setError('Please complete the captcha first.');
      return;
    }

    setPhase('uploading');
    setUploadPct(0);
    setError('');
    setSrt('');
    setJob(null);

    const form = new FormData();
    form.append('file', file);
    form.append('language', language);
    form.append('turnstile_token', token);
    if (termsText.trim()) form.append('terms', termsText.trim());

    /* XHR rather than fetch: only XHR reports upload progress, and a large
       video on a home connection is a long enough wait to need one. */
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('POST', `${WHISPER_API_BASE}/api/transcribe`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadPct(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (!aliveRef.current) return;
      let payload: { job_id?: string; detail?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error body */
      }
      // The token is single use, so a new one is needed either way.
      captchaRef.current?.reset();
      if (xhr.status >= 200 && xhr.status < 300 && payload.job_id) {
        setPhase('working');
        poll(payload.job_id);
      } else {
        setError(payload.detail || `Upload failed (${xhr.status})`);
        setPhase('error');
      }
    };

    xhr.onerror = () => {
      if (!aliveRef.current) return;
      captchaRef.current?.reset();
      setError('Network error. The demo server may be offline.');
      setPhase('error');
    };

    xhr.send(form);
  }, [file, language, token, poll]);

  const download = useCallback(() => {
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stem = (file?.name || 'subtitles').replace(/\.[^.]+$/, '');
    link.href = url;
    link.download = `${stem}_${language}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [srt, file, language]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(srt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy to the clipboard.');
    }
  }, [srt]);

  const busy = phase === 'uploading' || phase === 'working';
  const queued = phase === 'working' && job?.status === 'queued';
  const pct =
    phase === 'uploading' ? uploadPct : Math.round((job?.progress ?? 0) * 100);

  /*
   * clip-path, never width. Animating width is a layout and a paint on every
   * frame and is on the hard-ban list; a clip reveal composites. Same
   * construction as the Tokyo progress strip, including the spring constants:
   * damping / (2 * sqrt(stiffness)) = 30 / (2 * sqrt(220)) = 1.01, critically
   * damped, so the bar never overshoots a value it then has to walk back.
   */
  const rawPct = useMotionValue(0);
  const springPct = useSpring(rawPct, { stiffness: 220, damping: 30 });
  const clipSource = reduce ? rawPct : springPct;
  const clipPath = useTransform(clipSource, (value) => {
    const clamped = Math.max(0, Math.min(100, value));
    return `inset(0 ${100 - clamped}% 0 0 round 999px)`;
  });

  useEffect(() => {
    rawPct.set(queued ? 0 : pct);
  }, [pct, queued, rawPct]);

  let statusLine = '';
  if (phase === 'uploading') {
    statusLine = `Uploading ${uploadPct}%`;
  } else if (phase === 'working' && job) {
    if (job.status === 'queued') {
      const wait =
        job.eta_seconds > 0 ? `, about ${formatClock(job.eta_seconds)} left` : '';
      statusLine = `In line, position ${job.queue_position}${wait}`;
    } else if (job.stage === 'Transcribing' && job.duration) {
      statusLine = `Transcribing ${pct}% (${formatClock(
        job.progress * job.duration
      )} / ${formatClock(job.duration)})`;
    } else {
      statusLine = job.stage;
    }
  } else if (phase === 'done' && job) {
    statusLine = `Done, ${job.cue_count} subtitles`;
  }

  /* The server rejects untokened uploads when it has a secret. If it does and
     this page has no site key, say so plainly instead of letting every upload
     fail with a server error the visitor cannot act on. */
  const captchaMismatch = Boolean(health?.captcha_required) && !TURNSTILE_SITE_KEY;
  const canStart =
    Boolean(file) &&
    !busy &&
    !captchaMismatch &&
    !termsError &&
    (!TURNSTILE_SITE_KEY || Boolean(token));

  return (
    <div className="bezel">
      <div className="bezel-core p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Subtitle generator
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">
              Video or audio in, a cleaned SRT out.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.045] px-3 py-1.5 font-mono text-xs text-ink-dim shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            <Cpu className="h-3.5 w-3.5" strokeWidth={1.5} />
            {health?.default_model ?? 'large-v3'}
            {health?.gpu ? ' · GPU' : ''}
          </span>
        </div>

        {/* Drop zone */}
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            selectFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-12 text-center transition-[background-color,box-shadow] duration-[280ms] ease-out-strong ${
            dragging
              ? 'bg-glow/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]'
              : 'bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.035]'
          }`}
        >
          <input
            type="file"
            accept={WHISPER_ACCEPT}
            className="sr-only"
            onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          />
          <Upload className="h-5 w-5 text-glow" strokeWidth={1.5} />
          {file ? (
            <>
              <span className="mt-4 max-w-full truncate text-sm font-medium text-ink">
                {file.name}
              </span>
              <span className="mt-1.5 font-mono text-xs text-ink-faint">
                {formatBytes(file.size)} · click to change
              </span>
            </>
          ) : (
            <>
              <span className="mt-4 text-sm font-medium text-ink">
                Drop a video or audio file
              </span>
              <span className="mt-1.5 text-xs text-ink-faint">
                or click to browse
              </span>
            </>
          )}
        </label>

        {limits && (
          <p className="mt-3 font-mono text-xs text-ink-faint">
            Up to {limits.max_upload_mb} MB and{' '}
            {Math.round(limits.max_duration_sec / 60)} minutes ·{' '}
            {limits.rate_limit_per_hour} per hour
          </p>
        )}

        {/* Language */}
        <div className="mt-8">
          <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            Language
          </span>
          <div
            role="group"
            aria-label="Language"
            className="mt-3 inline-flex gap-1 rounded-full bg-white/[0.03] p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                aria-pressed={language === item.code}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-[280ms] ease-out-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 ${
                  language === item.code
                    ? 'bg-white/[0.08] text-ink'
                    : 'text-ink-faint hover:text-ink-dim'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.03] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-5">
          <button
            type="button"
            onClick={() => setTermsOpen((open) => !open)}
            aria-expanded={termsOpen}
            className="flex w-full items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
          >
            <span>
              <span className="block text-sm text-ink">Custom terms</span>
              <span className="mt-1 block text-sm text-ink-faint">
                Names, brands or jargon it keeps getting wrong? Spell them out.
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-3 py-1 text-sm text-ink-dim">
              {termsOpen ? 'Hide' : 'Add'}
            </span>
          </button>

          {termsOpen && (
            <div className="mt-4">
              <p className="text-sm text-ink-faint">
                Put what it hears on the left, what it should say on the right.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-black/20 p-3 font-mono text-[13px] text-ink-dim">
{`{
  "reyki": "reiki",
  "chat gpt": "ChatGPT"
}`}
              </pre>
              <textarea
                rows={5}
                spellCheck={false}
                disabled={busy}
                value={termsText}
                onChange={(event) => onTermsChange(event.target.value)}
                placeholder={'{ "reyki": "reiki" }'}
                aria-label="Custom terms"
                className={`mt-3 w-full rounded-xl bg-white/[0.03] p-3 font-mono text-[13px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] outline-none transition-shadow duration-[280ms] ease-out-strong placeholder:text-ink-faint/60 disabled:opacity-50 ${
                  termsError
                    ? 'shadow-[inset_0_0_0_1px_rgba(248,113,113,0.45)]'
                    : 'focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                }`}
              />
              {termsError ? (
                <p className="mt-2 text-sm text-red-400">{termsError}</p>
              ) : (
                <p className="mt-2 text-sm text-ink-faint">
                  Capitals do not matter, and only whole words are replaced.
                  Used for this file only, then thrown away.
                </p>
              )}
            </div>
          )}
        </div>

        <Turnstile
          ref={captchaRef}
          onToken={setToken}
          onError={() => setError('Could not load the captcha.')}
          className="mt-8"
        />

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss"
          >
            {busy ? 'Working' : 'Generate subtitles'}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
              <Upload className="h-4 w-4" strokeWidth={1.5} />
            </span>
          </button>

          {(file || phase !== 'idle') && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-ink-dim transition-colors duration-[280ms] ease-out-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
              Start over
            </button>
          )}
        </div>

        {/* Progress */}
        {(busy || phase === 'done') && (
          <div className="mt-8">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                style={{ clipPath }}
                className="h-full w-full rounded-full bg-gradient-to-r from-glow-deep to-glow"
              />
            </div>
            <p
              aria-live="polite"
              className="mt-3 font-mono text-xs text-ink-dim"
            >
              {statusLine}
            </p>
          </div>
        )}

        {(error || captchaMismatch) && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-400/30 bg-red-400/[0.06] p-4 text-sm leading-relaxed text-red-200"
          >
            {captchaMismatch
              ? 'The demo server requires a captcha but this page has no site key configured, so uploads cannot be accepted right now.'
              : error}
          </div>
        )}

        {/* Result */}
        {phase === 'done' && srt && (
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                Cleaned SRT
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-2 text-sm text-ink-dim transition-colors duration-[280ms] ease-out-strong hover:text-ink"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-2 text-sm font-medium text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Download .srt
                </button>
              </div>
            </div>
            <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-black/30 p-5 font-mono text-xs leading-relaxed text-ink-dim shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
              {srt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
