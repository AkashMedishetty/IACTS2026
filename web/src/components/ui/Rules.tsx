import type { ReactNode } from "react";

/** The flyer's gold diamond divider, rebuilt as a real rule. */
export function DiamondRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--hair-gold)]" />
      <span className="size-[7px] rotate-45 bg-gold" />
      <span className="h-px flex-1 bg-[var(--hair-gold)]" />
    </div>
  );
}

export function Hair({ className = "" }: { className?: string }) {
  return <hr className={`u-hair ${className}`} />;
}

/** Numbered section label, set like an operative-note heading. */
export function SectionLabel({
  index,
  children,
}: {
  index?: string;
  children: ReactNode;
}) {
  return (
    <p className="u-eyebrow flex items-center gap-3">
      {index ? <span className="text-gold u-tabular">{index}</span> : null}
      <span>{children}</span>
    </p>
  );
}

/** Engraved callout label with a leader line — borrowed from the
    anatomical-atlas direction, as agreed in the concept lock. */
export function Callout({
  title,
  sub,
  className = "",
}: {
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`relative font-mono text-[9px] tracking-[0.1em] ${className}`}>
      <span className="block text-[9.5px] font-semibold tracking-[0.06em] text-ink">
        {title}
      </span>
      {sub ? <span className="block text-ink-soft">{sub}</span> : null}
    </div>
  );
}

export function SectionHead({
  index,
  label,
  title,
  lede,
  align = "left",
}: {
  index?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <header
      className={
        align === "center"
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      <div data-reveal>
        <SectionLabel index={index}>{label}</SectionLabel>
      </div>
      <h2
        data-reveal
        className="u-display mt-5 text-[clamp(1.9rem,4.4vw,3.6rem)] font-extrabold tracking-[-0.025em]"
      >
        {title}
      </h2>
      {lede ? (
        <p
          data-reveal
          className={`mt-5 text-[0.975rem] leading-relaxed text-ink-soft ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
