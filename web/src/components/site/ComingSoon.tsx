import { conferenceConfig } from "@/config/conference.config";

/** A plain holding state for sections the committee has not published yet. */
export default function ComingSoon({
  label = "Announcing soon",
  lines = [],
}: {
  label?: string;
  lines?: string[];
}) {
  return (
    <section>
      <div className="u-shell py-[clamp(2rem,6vh,4rem)]">
        <div className="border border-[var(--hair)] bg-white px-6 py-10 text-center">
          <p className="font-mono text-[13px] font-semibold uppercase tracking-[.16em] text-[#b3122a]">{label}</p>
          {lines.map((line) => (
            <p key={line} className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-[1.75] text-[#614d53]">
              {line}
            </p>
          ))}
          <p className="mt-6 font-mono text-[12px] uppercase tracking-[.12em] text-[#7d656c]">
            Questions:{" "}
            <a href={`mailto:${conferenceConfig.contact.email}`} className="text-[#b3122a]">
              {conferenceConfig.contact.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
