"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarClock,
  Clock,
  Copy,
  Globe,
  Loader2,
  Mail,
  PhoneCall,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { bookingSlots, bookingTopics, person, projectTypes } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const inputCls =
    "w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-[var(--apple-green)]/50 focus:bg-[var(--glass-bg-strong)]";

  return (
    <section id="contact" aria-label="Contact" className="relative scroll-mt-28 px-5 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="04 · Get In Touch"
          title="Let's build something great."
          description="Have a project, role, or idea worth obsessing over? My inbox is open — and I reply fast."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Direct channels */}
          <div className="flex flex-col gap-4">
            <Reveal>
              <button
                onClick={copyEmail}
                className="glass group flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-strong)]"
              >
                <span className="glass-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <Mail className="h-4.5 w-4.5 text-[var(--apple-green)]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Email
                  </span>
                  <span className="block truncate text-sm font-semibold">{person.email}</span>
                </span>
                <Copy className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-[var(--apple-green)]" />
              </button>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="glass grid grid-cols-1 gap-4 rounded-3xl p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <ContactFact icon={Clock} label="Response" value="Within 24h" />
                <ContactFact icon={Globe} label="Location" value={person.location} />
                <ContactFact icon={CalendarClock} label="Status" value="Open for work" />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="glass relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
                <div
                  className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl"
                  style={{ background: "var(--orb-2)" }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3.5">
                  <span className="glass-strong flex h-11 w-11 items-center justify-center rounded-2xl">
                    <PhoneCall className="h-4.5 w-4.5 text-[var(--apple-orange)]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Prefer talking?
                    </p>
                    <h3 className="text-[15px] font-semibold">30-min discovery call</h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Discuss technical architecture, roadmap, and feasibility — no slides, just honest engineering talk.
                </p>
                <button
                  onClick={() => {
                    playSound("chime");
                    setBookingOpen(true);
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95"
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
              className="glass h-full rounded-[2rem] p-6 sm:p-8"
              aria-label="Contact form"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apple-green)]">
                    Direct Message
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">Tell me about your project</h3>
                </div>
                <span className="glass rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  {person.responseTime}
                </span>
              </div>

              {/* Type chips */}
              <fieldset className="mt-6">
                <legend className="mb-2.5 text-[13px] font-medium text-muted-foreground">
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
                      className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 active:scale-95 ${
                        type === t
                          ? "bg-foreground text-background"
                          : "border border-[var(--glass-border)] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-muted-foreground">Your name</span>
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
                  <span className="text-[13px] font-medium text-muted-foreground">Your email</span>
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
                <span className="text-[13px] font-medium text-muted-foreground">
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
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-4 w-4 text-[var(--apple-green)]" />
      </span>
      <div>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="text-[13px] font-semibold">{value}</p>
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

  const inputCls =
    "w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/60 focus:border-[var(--apple-green)]/50 focus:bg-[var(--glass-bg-strong)]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[86vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-[1.75rem] p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-foreground)]">
          <CalendarClock className="h-3 w-3" />
          Instant Scheduling
        </span>
        <DialogTitle className="mt-4 text-2xl font-semibold tracking-tight">
          Book a 30-min discovery call
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick a convenient slot — we&apos;ll explore requirements and next steps with zero pressure.
        </DialogDescription>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-muted-foreground">Meeting topic</span>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-full rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
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
              <span className="text-[13px] font-medium text-muted-foreground">Preferred date</span>
              <input
                type="date"
                className={inputCls}
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-muted-foreground">Time slot</span>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger className="w-full rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm">
                  <SelectValue placeholder="Pick a slot" />
                </SelectTrigger>
                <SelectContent>
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
            <span className="text-[13px] font-medium text-muted-foreground">Your email</span>
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
            className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Scheduling…" : "Confirm & Schedule"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
