"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { IconCheck } from "@/components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type State = "idle" | "loading" | "success" | "error";

export function Waitlist() {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; form?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = t.waitlist.errors.firstName;
    if (!email.trim()) e.email = t.waitlist.errors.emailRequired;
    else if (!EMAIL_RE.test(email.trim())) e.email = t.waitlist.errors.emailInvalid;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setState("loading");
    setErrors({});
    track("waitlist_submit");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), email: email.trim().toLowerCase() }),
      });
      if (res.status === 409) {
        setState("error");
        setErrors({ form: t.waitlist.errors.duplicate });
        return;
      }
      if (!res.ok) throw new Error("bad status");
      setState("success");
      track("waitlist_success");
    } catch {
      setState("error");
      setErrors({ form: t.waitlist.errors.generic });
    }
  };

  return (
    <Section id="waitlist" tone="leather" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(179,138,63,0.14), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-xl text-center">
        <Reveal>
          <Eyebrow onDark>{t.waitlist.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-onDark sm:text-[2.75rem]">
            {t.waitlist.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md font-sans text-lg text-onDarkMuted">{t.waitlist.subtitle}</p>
        </Reveal>

        <Reveal delay={100} className="mt-9">
          {state === "success" ? (
            <div
              role="status"
              className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-8"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold">
                <IconCheck className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-2xl text-onDark">{t.waitlist.successTitle}</h3>
              <p className="font-sans text-sm text-onDarkMuted">{t.waitlist.successBody}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mx-auto max-w-md text-left">
              <div className="flex flex-col gap-4">
                <Field
                  id="wl-first"
                  label={t.waitlist.firstName}
                  placeholder={t.waitlist.firstNamePlaceholder}
                  value={firstName}
                  onChange={setFirstName}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <Field
                  id="wl-email"
                  label={t.waitlist.email}
                  placeholder={t.waitlist.emailPlaceholder}
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                  type="email"
                  autoComplete="email"
                />
              </div>

              {errors.form && (
                <p role="alert" className="mt-3 font-sans text-sm text-[#F0C6A0]">
                  {errors.form}
                </p>
              )}

              <Button
                type="submit"
                variant="onDark"
                size="lg"
                disabled={state === "loading"}
                className="mt-5 w-full"
              >
                {state === "loading" ? t.waitlist.submitting : t.waitlist.submit}
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}

function Field({
  id, label, placeholder, value, onChange, error, type = "text", autoComplete,
}: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; type?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-sans text-sm font-medium text-onDark">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="h-12 w-full rounded-xl border border-white/20 bg-white/95 px-4 font-sans text-ink outline-none transition-shadow placeholder:text-muted/70 focus:border-gold focus:ring-2 focus:ring-gold/40"
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 font-sans text-sm text-[#F0C6A0]">
          {error}
        </p>
      )}
    </div>
  );
}
