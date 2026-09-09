import { EVENT_INFO } from "@/lib/constants";
import { secretariat, venues, registrationHelpline } from "@/data/conference";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--hair)] bg-ink-2">
      <div className="u-shell pt-[clamp(3rem,7vh,6rem)]">
        <div className="grid gap-2">
          <p className="u-eyebrow text-gold-lift" data-r>{EVENT_INFO.acronym} Technocollege CME 2026</p>
          <p className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1] tracking-[-0.03em] text-[#b3122a]" data-r>
            {EVENT_INFO.dateLabel}
          </p>
          <p className="text-[clamp(1rem,2vw,1.3rem)] font-semibold text-[#160a0d]" data-r>{EVENT_INFO.city}</p>
        </div>

        <div className="mt-[clamp(2.5rem,6vh,4rem)] grid gap-[clamp(1.5rem,3vw,3rem)] border-t border-[var(--hair)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((v) => (
            <div key={v.id} data-r>
              <p className="u-eyebrow text-gold-lift">{v.name}</p>
              <p className="mt-2 text-[0.92rem] text-muted-foreground">{v.hosts}</p>
              <p className="mt-1 text-[0.88rem] text-muted-foreground">{v.address}</p>
            </div>
          ))}
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Secretariat</p>
            <p className="mt-2 text-[0.92rem] text-muted-foreground">{secretariat.department}</p>
            <p className="text-[0.92rem] text-muted-foreground">{secretariat.city}</p>
            <a href={`mailto:${secretariat.email}`}
              className="mt-2 inline-block text-[0.92rem] text-bone underline decoration-[var(--hair-gold)] underline-offset-4 transition-colors duration-500 hover:text-gold-lift">
              {secretariat.email}
            </a>
            {secretariat.phones.map((p) => (
              <a
                key={p.number}
                href={`tel:+91${p.number}`}
                className="mt-2.5 block text-[clamp(1rem,1.6vw,1.2rem)] font-bold leading-snug text-[#b3122a] no-underline"
              >
                {p.name} · +91 {p.number}
              </a>
            ))}
          </div>
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Register</p>
            <a href="/register" className="mt-2 inline-flex min-h-11 items-center gap-2 bg-[#b3122a] px-5 text-[13px] font-bold uppercase tracking-[.08em] text-white no-underline transition-transform hover:-translate-y-0.5">
              Register now
            </a>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[.16em] text-[#7d656c]">
              {registrationHelpline.label}
            </p>
            <a
              href={`tel:+91${registrationHelpline.number}`}
              className="mt-1.5 block text-[clamp(1rem,1.6vw,1.2rem)] font-bold leading-snug text-[#b3122a] no-underline"
            >
              {registrationHelpline.name} · +91 {registrationHelpline.number}
            </a>
          </div>
        </div>

        <div className="mt-[clamp(2rem,5vh,3rem)] grid gap-[clamp(1.5rem,3vw,3rem)] border-t border-[var(--hair)] pt-8 sm:grid-cols-2">
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Event Partner</p>
            <p className="mt-2 text-[clamp(1.1rem,2vw,1.4rem)] font-extrabold tracking-[-0.01em] text-[#160a0d]">Ideal Events</p>
            <p className="mt-2 text-[0.9rem] text-muted-foreground">On-ground event management and delegate services.</p>
            <a href="tel:+917842224444" className="mt-3 inline-block text-[1rem] font-bold text-[#b3122a] no-underline">
              Bobby Marni · +91 78422 24444
            </a>
          </div>
          <div data-r>
            <p className="u-eyebrow text-gold-lift">Tech Partner</p>
            <a href="https://purplehatevents.in/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[clamp(1.1rem,2vw,1.4rem)] font-extrabold tracking-[-0.01em] text-[#160a0d] no-underline transition-colors hover:text-[#b3122a]">
              PurpleHat Events
            </a>
            <p className="mt-2 max-w-md text-[0.9rem] text-muted-foreground">
              Professional conference management, registration systems and event technology solutions.
            </p>
            <p className="mt-2 font-mono text-[0.66rem] uppercase leading-[1.9] tracking-[0.12em] text-[#7d656c]">
              Event Management · Registration Systems · Conference Technology · Digital Solutions
            </p>
            <a href="tel:+917995283402" className="mt-3 inline-block text-[1rem] font-bold text-[#b3122a] no-underline">
              Ajith Sai · +91 79952 83402
            </a>
            <a href="https://purplehatevents.in/" target="_blank" rel="noopener noreferrer" className="mt-2 block text-[0.85rem] text-muted-foreground underline decoration-[var(--hair-gold)] underline-offset-4">
              purplehatevents.in
            </a>
          </div>
        </div>
      </div>

      <div className="mt-[clamp(2rem,5vh,4rem)] border-t border-[#b3122a]/20">
        <div className="u-shell flex flex-wrap items-baseline justify-between gap-4 py-6">
          <p className="font-mono text-[clamp(.95rem,1.5vw,1.35rem)] font-medium uppercase tracking-[.34em] text-[#b3122a]">
            IACTS 2026
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[.2em] text-[#7d656c]">
            Technocollege CME · Hyderabad, India
          </p>
        </div>
        <div className="h-1.5 bg-[#b3122a]" />
      </div>
    </footer>
  );
}
