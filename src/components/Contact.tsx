'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = encodeURIComponent(`Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border ${
      errors[field] ? 'border-red-400/40' : 'border-white/10'
    } bg-white/[0.04] px-4 py-3 text-sm text-ink placeholder-ink-faint transition-colors duration-300 focus:border-glow/50 focus:outline-none`;

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
            <div className="mt-10 space-y-4">
              {siteConfig.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-max items-center gap-3 text-sm text-ink-dim transition-colors duration-300 hover:text-ink"
                >
                  <link.icon className="h-4 w-4" strokeWidth={1.5} />
                  {link.label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 opacity-0 transition-[opacity,transform] duration-200 ease-out-strong group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </a>
              ))}
            </div>
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
                className="bezel-core space-y-6 p-7 sm:p-9"
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
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className={inputClass(field)}
                      placeholder={
                        field === 'name' ? 'Your name' : 'you@example.com'
                      }
                    />
                    {errors[field] && (
                      <p className="mt-2 text-xs text-red-300">
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
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={`${inputClass('message')} resize-none`}
                    placeholder="Tell me about your project..."
                  />
                  {errors.message && (
                    <p className="mt-2 text-xs text-red-300">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms]"
                >
                  Send message
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
