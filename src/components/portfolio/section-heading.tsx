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
          className="h-px w-10"
          style={{ background: "linear-gradient(90deg, transparent, var(--ember))" }}
          aria-hidden="true"
        />
        <p className="font-tag text-[10.5px] font-bold text-ember">{eyebrow}</p>
        {centered && (
          <span
            className="h-px w-10"
            style={{ background: "linear-gradient(90deg, var(--ember), transparent)" }}
            aria-hidden="true"
          />
        )}
      </div>
      <h2 className="font-display mt-4 text-3xl leading-[1.04] tracking-tight sm:text-4xl lg:text-[2.9rem]">
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
