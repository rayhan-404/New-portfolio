"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Clock,
  Copy,
  Globe,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { bookingSlots, bookingTopics, person, projectTypes } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SectionNumber } from "./section-number";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const inputCls =
  "glass-input w-full rounded-xl md:rounded-2xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70";

export function ContactSection() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [type, setType] = useState<string>(projectTypes[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);

  const copyEmail = async () => {
    playSound("pop");
    try {
      await navigator.clipboard.writeText(person.email);
      toast.success("Email copied to clipboard", { description: person.email });
    } catch {
      toast.info("Email", { description: person.email });
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    playSound("tap");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, eventType: type, message, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      toast.success(`Thank you, ${name}!`, {
        description: `Your ${type} inquiry landed in my inbox — expect a reply within 24h.`,
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* ghost numeral — 5% backward parallax, same recipe as projects/skills */}
      <SectionNumber
        index="05"
        className="-top-4 right-0 hidden text-[11rem] lg:block"
      />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="05 · Get In Touch"
          title="Let's build something worth signing."
          description="Have a project, role, or idea worth obsessing over? My inbox is open — and I reply fast."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Direct channels */}
          <div className="flex flex-col gap-4">
            <Reveal>
              <button
                onClick={copyEmail}
                className="glass neu-decor group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl md:rounded-3xl p-5 text-left transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-neu-lg)]"
              >
                {/* Gmail texture wash — ref .contact-btn.email::before (exact values) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(234,67,53,0.05),rgba(234,67,53,0.02))]"
                />
                {/* Gmail gradient tile — ref .contact-btn.email .contact-icon (exact) */}
                <span
                  className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-[linear-gradient(135deg,#EA4335,#FBBC05)] text-white shadow-[0_4px_12px_rgba(234,67,53,0.3)]"
                >
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <span className="relative z-[1] min-w-0 flex-1">
                  <span className="font-tag block text-[9.5px] text-muted-foreground">Email</span>
                  <span className="block truncate text-sm font-semibold">{person.email}</span>
                </span>
                <Copy className="relative z-[1] h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-[#EA4335]" />
              </button>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="glass neu-decor grid grid-cols-1 gap-4 rounded-2xl md:rounded-3xl p-5">
                <ContactFact icon={Clock} label="Response" value="Within 24h" tone="info" />
                <ContactFact icon={Globe} label="Location" value={person.location} />
                <ContactFact icon={ArrowUpRight} label="Status" value="Available" tone="success" />
              </div>
            </Reveal>

            <Reveal delay={0.12} className="lg:flex-1">
              <div className="glass-ember relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-2xl md:rounded-3xl p-6">
                <div
                  className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.25),transparent_70%)] blur-2xl"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3.5">
                  <span className="glass-chip flex h-11 w-11 items-center justify-center rounded-xl md:rounded-2xl">
                    <CalendarClock className="h-4.5 w-4.5 text-accent-ink" />
                  </span>
                  <div>
                    <p className="font-tag text-[9.5px] text-accent-ink">Prefer talking?</p>
                    <h3 className="text-[15px] font-semibold">30-min discovery call</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  Discuss technical architecture, roadmap, and feasibility — no slides, just honest
                  engineering talk.
                </p>
                <button
                  onClick={() => {
                    playSound("chime");
                    setBookingOpen(true);
                  }}
                  className="btn-light inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 active:scale-95"
                >
                  <CalendarClock className="h-4 w-4" />
                  Book a Call
                </button>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.08}>
            <form
              onSubmit={submit}
              className="glass neu-decor relative h-full rounded-2xl md:rounded-[2rem] p-6 sm:p-8"
              aria-label="Contact form"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-tag text-[10px] text-accent-ink">Direct Message</p>
                  <h3 className="font-display mt-2 text-xl tracking-tight">
                    Tell me about your project
                  </h3>
                </div>
                <span className="glass-chip font-tag rounded-full px-3.5 py-1.5 text-[9px] text-muted-foreground">
                  {person.responseTime}
                </span>
              </div>

              {/* Type chips */}
              <fieldset className="mt-6">
                <legend className="mb-2.5 text-[13px] font-medium text-foreground/70">
                  I&apos;m looking for
                </legend>
                <div className="flex flex-wrap gap-2">
                  {projectTypes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={type === t}
                      onClick={() => {
                        playSound("tap");
                        setType(t);
                      }}
                      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 active:scale-95 ${
                        type === t
                          ? "bg-primary text-primary-foreground shadow-[0_10px_26px_-10px_rgba(var(--primary-rgb)/0.6)]"
                          : "glass-chip text-foreground/75 hover:text-primary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-foreground/70">Your name</span>
                  <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-foreground/70">Your email</span>
                  <input
                    className={inputCls}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    autoComplete="email"
                  />
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-foreground/70">
                  Project goals & scope
                </span>
                <textarea
                  className={`${inputCls} min-h-32 resize-y`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you want to build, target timeline, technical requirements…"
                  required
                  minLength={10}
                  maxLength={4000}
                />
              </label>

              {/* Honeypot — invisible to humans */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-light inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
                <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-44">
                  Stored securely & used only to reply to you.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
}

function ContactFact({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  /** Reference semantic colors: success green, info blue, primary deep orange. */
  tone?: "primary" | "success" | "info";
}) {
  const toneCls =
    tone === "success" ? "text-success-text" : tone === "info" ? "text-info" : "text-gold";
  return (
    <div className="flex items-center gap-3">
      <span className="glass-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className={`h-4 w-4 ${toneCls}`} />
      </span>
      <div>
        <p className="font-tag text-[9.5px] text-muted-foreground">{label}</p>
        <p
          className={`text-[13px] font-semibold ${
            tone === "success" ? "text-success-text" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function BookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [topic, setTopic] = useState<string>(bookingTopics[0]);
  const [slot, setSlot] = useState<string>(bookingSlots[0]);
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Default date = tomorrow (client-only to avoid hydration mismatch)
  useEffect(() => {
    const d = new Date(Date.now() + 86_400_000);
    setDate(d.toISOString().slice(0, 10));
  }, []);

  const confirm = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, date, timeSlot: slot, email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not schedule the call");
      toast.success("Call scheduled!", {
        description: `${topic} · ${date} · ${slot}. Calendar invite sent to ${email}.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[86vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl sm:rounded-[1.75rem] border-border bg-[var(--bg)] p-6 shadow-[var(--shadow-neu-lg)] sm:p-8">
        <span className="glass-chip font-tag inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] text-accent-ink">
          <CalendarClock className="h-3 w-3" />
          Instant Scheduling
        </span>
        <DialogTitle className="font-display mt-4 text-2xl tracking-tight">
          Book a 30-min discovery call
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick a convenient slot — we&apos;ll explore requirements and next steps with zero
          pressure.
        </DialogDescription>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-foreground/70">Meeting topic</span>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="glass-input w-full rounded-xl md:rounded-2xl px-4 py-3 text-sm text-foreground">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent className="rounded-xl md:rounded-2xl border-border bg-[var(--bg2)] text-foreground shadow-[var(--shadow-neu-lg)]">
                {bookingTopics.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-foreground/70">Preferred date</span>
              <input
                type="date"
                className={inputCls}
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-foreground/70">Time slot</span>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="glass-input w-full rounded-xl md:rounded-2xl px-4 py-3 text-sm text-foreground">
                  <SelectValue placeholder="Pick a slot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl md:rounded-2xl border-border bg-[var(--bg2)] text-foreground shadow-[var(--shadow-neu-lg)]">
                  {bookingSlots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-foreground/70">Your email</span>
            <input
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              autoComplete="email"
            />
          </label>

          <button
            onClick={confirm}
            disabled={sending || !email || !date}
            className="btn-light mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Scheduling…" : "Confirm & Schedule"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
