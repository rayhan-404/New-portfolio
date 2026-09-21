"use client";

import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "text-center" : ""}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        <span
          className="h-px w-8"
          style={{ background: "linear-gradient(90deg, transparent, var(--apple-green))" }}
          aria-hidden="true"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--apple-green)]">
          {eyebrow}
        </p>
        {centered && (
          <span
            className="h-px w-8"
            style={{ background: "linear-gradient(90deg, var(--apple-green), transparent)" }}
            aria-hidden="true"
          />
        )}
      </div>
      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
