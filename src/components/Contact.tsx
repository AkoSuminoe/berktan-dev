'use client';

import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { SocialLinkList } from '@/components/SocialLinks';
import LondonTime from '@/components/LondonTime';
import ContactSuccessModal from '@/components/ContactSuccessModal';
import Turnstile, {
  TURNSTILE_SITE_KEY,
  type TurnstileHandle,
} from '@/components/Turnstile';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Field = 'name' | 'email' | 'message';

/*
 * A discriminated union rather than a pair of booleans, for the same reason
 * the Spotify payload is one: `sending` and `sent` being true together is not
 * a state this form has, and the type should say so.
 */
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

const FALLBACK_HINT = 'You can also email me directly.';

/*
 * Server error codes mapped to something a person can act on. Anything
 * unrecognised falls through to the generic message rather than surfacing a
 * code, and every branch leaves the direct email available, so the form is
 * never a dead end.
 */
function messageForError(code: string): string {
  switch (code) {
    case 'rate_limited':
      return `That is a few messages in a short space of time. ${FALLBACK_HINT}`;
    case 'unconfigured':
      return `The form is not connected to a mailbox yet. ${FALLBACK_HINT}`;
    case 'too_large':
      return 'That message is too long to send through the form.';
    case 'captcha_failed':
      return `The captcha could not be verified. Try it once more, or ${FALLBACK_HINT.toLowerCase()}`;
    default:
      return `Something went wrong sending that. ${FALLBACK_HINT}`;
  }
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  /* Honeypot. Never shown, never filled by a person. */
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const submitRef = useRef<HTMLButtonElement>(null);

  /* Empty until the widget hands one over, and emptied again whenever it
     stops being valid. Gating is skipped entirely when no site key exists. */
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef<TurnstileHandle>(null);
  const captchaRequired = Boolean(TURNSTILE_SITE_KEY);

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!formData.name.trim()) e.name = 'Please add your name.';
    if (!formData.email.trim()) e.email = 'Please add your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'That email does not look right.';
    if (!formData.message.trim()) e.message = 'Please add a message.';
    else if (formData.message.trim().length < 10)
      e.message = 'A little more detail helps.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Pre-filled with whatever they already typed, so the fallback costs them
     nothing beyond one click. */
  const mailtoHref = () => {
    const subject = encodeURIComponent(
      formData.name ? `Portfolio enquiry from ${formData.name}` : 'Hello'
    );
    const body = encodeURIComponent(formData.message);
    return `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status.kind === 'sending') return;
    if (!validate()) return;
    if (captchaRequired && !captchaToken) return;

    setStatus({ kind: 'sending' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reference,
          turnstileToken: captchaToken,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        // Unconditional, because a token is single use and may already have
        // been spent at the verify endpoint. Re-arming costs the visitor one
        // click; leaving a spent token in place costs them a second failure
        // with no visible cause.
        captchaRef.current?.reset();
        setStatus({
          kind: 'error',
          message: messageForError(payload?.error ?? 'unknown'),
        });
        return;
      }

      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      captchaRef.current?.reset();
      setStatus({ kind: 'sent' });
    } catch {
      // Offline, DNS, a tunnel that is down. Same recovery either way.
      captchaRef.current?.reset();
      setStatus({ kind: 'error', message: messageForError('network') });
    }
  };

  const closeModal = () => {
    setStatus({ kind: 'idle' });
    // Send focus back where it came from rather than to the top of the page.
    submitRef.current?.focus();
  };

  const inputClass = (field: Field) =>
    `w-full rounded-xl border ${
      errors[field] ? 'border-red-400/40' : 'border-white/10'
    } bg-white/[0.04] px-4 py-3 text-base sm:text-sm text-ink placeholder-ink-faint transition-colors duration-[280ms] ease-out-strong focus:border-glow/50 focus:outline-none`;

  const sending = status.kind === 'sending';

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Editorial headline + channels */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] text-ink">
              Let&apos;s work
              <br />
              together.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ink-dim">
              Have a project in mind or just want to chat? I&apos;m always open
              to new opportunities and interesting conversations.
            </p>

            {/* Where he is, before how to reach him: it is the first thing
                a London recruiter needs to confirm. */}
            <div className="mt-10">
              <LondonTime />
            </div>

            <SocialLinkList className="mt-10" />
          </motion.div>

          {/* Glass form */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease }}
          >
            <div className="bezel">
              <form
                onSubmit={handleSubmit}
                /* Native bubbles would pre-empt the styled messages below and
                   look nothing like the rest of the site. */
                noValidate
                /* `relative` anchors the absolutely positioned honeypot to
                   this form rather than to whatever ancestor happens to be
                   positioned. */
                className="bezel-core relative space-y-6 p-7 sm:p-9"
              >
                {(['name', 'email'] as const).map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="mb-2 block text-sm capitalize text-ink-dim"
                    >
                      {field}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      id={field}
                      name={field}
                      autoComplete={field === 'email' ? 'email' : 'name'}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      aria-invalid={errors[field] ? true : undefined}
                      aria-describedby={
                        errors[field] ? `${field}-error` : undefined
                      }
                      className={inputClass(field)}
                      placeholder={
                        field === 'name' ? 'Your name' : 'you@example.com'
                      }
                    />
                    {errors[field] && (
                      <p
                        id={`${field}-error`}
                        role="alert"
                        className="mt-2 text-xs text-red-300"
                      >
                        {errors[field]}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm text-ink-dim"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={
                      errors.message ? 'message-error' : undefined
                    }
                    className={`${inputClass('message')} resize-none`}
                    placeholder="Tell me about the role or the project..."
                  />
                  {errors.message && (
                    <p
                      id="message-error"
                      role="alert"
                      className="mt-2 text-xs text-red-300"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/*
                  Honeypot. Hidden from sight, from the tab order and from
                  assistive technology, so only something filling fields
                  programmatically will complete it. Not `display: none`,
                  which some bots specifically skip.
                */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                >
                  <input
                    id="reference"
                    name="reference"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                {status.kind === 'error' && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-4"
                  >
                    <p className="text-sm leading-relaxed text-red-200">
                      {status.message}
                    </p>
                    <a
                      href={mailtoHref()}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 decoration-white/30 transition-colors duration-[280ms] ease-out-strong hover:decoration-white"
                    >
                      {siteConfig.email}
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </a>
                  </div>
                )}

                {/* Renders nothing until a site key exists, so the form is
                    unchanged for a clone or a local run. */}
                <Turnstile
                  ref={captchaRef}
                  onToken={setCaptchaToken}
                  onError={() =>
                    setStatus({
                      kind: 'error',
                      message: messageForError('captcha_failed'),
                    })
                  }
                />

                <div>
                  <button
                    ref={submitRef}
                    type="submit"
                    disabled={sending || (captchaRequired && !captchaToken)}
                    className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-abyss"
                  >
                    {sending ? 'Sending' : 'Send message'}
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                      {sending ? (
                        <Loader2
                          className="h-4 w-4 animate-spin motion-reduce:animate-none"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </span>
                  </button>

                  {/* Renders only once there is a real commitment behind it. */}
                  {siteConfig.responseTime && (
                    <p className="mt-4 text-xs text-ink-faint">
                      {siteConfig.responseTime}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      <ContactSuccessModal open={status.kind === 'sent'} onClose={closeModal} />
    </section>
  );
}
