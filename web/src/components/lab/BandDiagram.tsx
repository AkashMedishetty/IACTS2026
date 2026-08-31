export type RibbonMode = "basal" | "apical" | "twist";

const PATH =
  "M90 248 C238 74 606 68 692 250 C756 386 650 482 506 454 C350 424 248 314 344 228 C448 134 618 226 602 410 C586 580 434 616 414 738 C402 804 446 850 524 876";

export default function BandDiagram({ mode }: { mode: RibbonMode }) {
  const basal = mode === "basal" ? 1 : mode === "twist" ? 0.72 : 0.25;
  const apical = mode === "apical" ? 1 : mode === "twist" ? 0.82 : 0.3;

  return (
    <svg
      viewBox="0 0 800 900"
      className="h-full w-full overflow-visible"
      role="img"
      aria-label="Structural study of the ventricular myocardial band"
    >
      <defs>
        <linearGradient id="band-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a0e14" />
          <stop offset=".5" stopColor="#c21d28" />
          <stop offset="1" stopColor="#8d0e16" />
        </linearGradient>
        <linearGradient id="band-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6d9e" stopOpacity=".8" />
          <stop offset="1" stopColor="#2f6d9e" stopOpacity="0" />
        </linearGradient>
        <filter id="band-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#7a0e14" floodOpacity=".14" />
        </filter>
        <mask id="ribbon-mask">
          <rect width="800" height="900" fill="black" />
          <path d={PATH} fill="none" stroke="white" strokeWidth="76" strokeLinecap="round" />
        </mask>
      </defs>

      {/* One continuous myocardial band. The earlier study rotated copies of
          this path and therefore fanned into a cone. Here the broad stroke IS
          the band; fine fibres are clipped inside the same stroke. */}
      <path
        d={PATH}
        fill="none"
        stroke="url(#band-red)"
        strokeWidth="76"
        strokeLinecap="round"
        opacity=".55"
        filter="url(#band-shadow)"
      />

      <g mask="url(#ribbon-mask)" fill="none" stroke="#f3b3b7" strokeLinecap="round">
        {[-22, -11, 0, 11, 22].map((offset, i) => (
          <path
            key={offset}
            d={PATH}
            strokeWidth={i === 2 ? 3.4 : 1.7}
            opacity={i === 2 ? 0.9 : 0.58}
            transform={`translate(0 ${offset})`}
          />
        ))}
      </g>

      <path
        d="M116 219 C260 72 610 78 687 253 C728 349 685 436 596 482"
        fill="none"
        stroke="#7a0e14"
        strokeWidth="6"
        strokeLinecap="round"
        opacity={basal}
        style={{ transition: "opacity .6s ease" }}
      />
      <path
        d="M596 482 C545 515 490 574 469 641 C443 724 463 796 525 852"
        fill="none"
        stroke="url(#band-blue)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity={apical}
        style={{ transition: "opacity .6s ease" }}
      />

      <g fill="#8d0e16" fontFamily="monospace" fontSize="11" letterSpacing="2.5">
        <text x="110" y="178">BASAL LOOP</text>
        <text x="548" y="654" transform="rotate(70 548 654)">APICAL DESCENT</text>
      </g>
      <circle cx="596" cy="482" r="6" fill="#b3121c" />
    </svg>
  );
}
