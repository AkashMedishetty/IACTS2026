import ThoracicDepth from "@/components/motion-lab/ThoracicDepth";
import MyocardiumUnwound from "@/components/motion-lab/MyocardiumUnwound";
import CardiacCycle from "@/components/motion-lab/CardiacCycle";

const CONCEPTS = [
  ["01", "Thoracic Depth Scan", "Scroll peels through drape, ribs and myocardium."],
  ["02", "Myocardium Unwound", "One fibre stream uncoils into the programme."],
  ["03", "One Cardiac Cycle", "One beat drives every spatial transition."],
] as const;

export default function MotionLabPage() {
  return (
    <main id="main" className="bg-[#fbfbfc] text-bone">
      <section id="motion-top" className="u-shell flex min-h-svh flex-col justify-between py-[clamp(2rem,8vh,6rem)]">
        <div className="flex items-center justify-between border-b border-black/10 pb-5">
          <p className="font-mono text-[.58rem] uppercase tracking-[.22em] text-crimson">IACTS / Motion concept laboratory</p>
          <p className="font-mono text-[.54rem] uppercase tracking-[.18em] text-faint">Production routes untouched</p>
        </div>

        <div className="my-[clamp(4rem,10vh,8rem)]">
          <p className="font-mono text-[.6rem] uppercase tracking-[.24em] text-crimson">Not posters. Three authored scroll acts.</p>
          <h1 className="mt-5 max-w-[11ch] text-[clamp(3.6rem,9vw,10rem)] font-black uppercase leading-[.76] tracking-[-.085em]">
            The body becomes the interface<span className="text-crimson">.</span>
          </h1>
          <p className="mt-8 max-w-[55ch] text-[clamp(.9rem,1.2vw,1.15rem)] leading-[1.65] text-muted">
            Each concept owns one motion system: anatomical depth, fibre continuity,
            or the cardiac cycle. Scroll biases the scene; pointer movement adds less
            than half a degree of parallax; reduced motion lands on the final frame.
          </p>
        </div>

        <nav className="grid gap-px bg-black/10 md:grid-cols-3" aria-label="Motion concepts">
          {CONCEPTS.map(([no, title, note]) => (
            <a
              key={no}
              href={no === "01" ? "#thoracic-depth" : no === "02" ? "#myocardium-unwound" : "#one-cycle"}
              className="group bg-[#fbfbfc] p-[clamp(1.25rem,2.5vw,2.5rem)] text-bone no-underline transition-colors hover:bg-[#f3f3f6]"
            >
              <span className="font-mono text-[.56rem] tracking-[.18em] text-crimson">{no}</span>
              <strong className="mt-5 block text-[clamp(1.25rem,2vw,1.9rem)] uppercase tracking-[-.045em]">{title}</strong>
              <span className="mt-3 block text-[.78rem] leading-[1.55] text-muted">{note}</span>
              <span className="mt-7 block font-mono text-[.53rem] uppercase tracking-[.18em] text-crimson">Enter sequence ↓</span>
            </a>
          ))}
        </nav>
      </section>

      <ThoracicDepth />
      <MyocardiumUnwound />
      <CardiacCycle />
    </main>
  );
}
