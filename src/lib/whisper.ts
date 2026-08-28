/*
 * Client contract for the Whisper subtitle service.
 *
 * The shapes here mirror `server/main.py` in the whisper-subtitle-generator
 * repository. They are duplicated rather than shared because the two projects
 * deploy separately and a Python server cannot export TypeScript types; if the
 * server contract changes, this file changes with it.
 */

/*
 * Empty in production, and that is the point. The Cloudflare Tunnel routes
 * whisper.berktan.dev/api/* to the FastAPI server and everything else to Next,
 * so the browser only ever talks to one origin. No CORS, no preflight, no
 * origin allowlist to keep in sync.
 *
 * In development the two run on different ports, so this is set to
 * http://localhost:8000 and CORS does apply.
 */
export const WHISPER_API_BASE = (
  process.env.NEXT_PUBLIC_WHISPER_API_URL ?? ''
).replace(/\/$/, '');

/*
 * Public origin of the demo. Lives here rather than in the page, because a
 * Next page module may only export a fixed set of names and any extra one
 * fails the build (not `tsc --noEmit`, which cannot see that constraint).
 */
export const WHISPER_URL = 'https://whisper.berktan.dev';

export type WhisperLanguage = 'tr' | 'en';

export type JobStatus = {
  status: 'queued' | 'running' | 'done' | 'error';
  stage: string;
  progress: number;
  duration: number | null;
  queue_position: number;
  eta_seconds: number;
  cue_count: number;
  error: string | null;
};

export type WhisperLimits = {
  max_upload_mb: number;
  max_duration_sec: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  max_queue_depth: number;
  api_key_required: boolean;
};

export type WhisperHealth = {
  status: string;
  device: string;
  gpu: string | null;
  default_model: string;
  queue_depth: number;
  /** True when the server has a Turnstile secret set and will reject untokened uploads. */
  captcha_required: boolean;
  limits: WhisperLimits;
};

/** Files the server accepts. Kept in step with ALLOWED_EXTENSIONS on the server. */
export const WHISPER_ACCEPT =
  '.mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.m4a,.ogg,.flac';

export const WHISPER_POLL_MS = 1000;

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
