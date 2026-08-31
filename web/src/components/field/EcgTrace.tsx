"use client";

import { useEffect, useRef } from "react";

/**
 * Concept 3's whole mechanic: one continuous ECG trace.
 *
 * The waveform is built from real component deflections (P, Q, R, S, T) rather
 * than a decorative zigzag, so a cardiologist reads it as a rhythm strip. Each
 * section of the page gets its own morphology — sinus, tachy, fibrillation —
 * driven by `rhythm`.
 */
export type Rhythm = "sinus" | "tachy" | "fib";

function deflection(ph: number, rhythm: Rhythm): number {
  if (rhythm === "fib") {
    // no organised P wave, irregular baseline, irregular narrow complexes
    return (
      0.1 * Math.sin(ph * 47) +
      0.08 * Math.sin(ph * 31 + 1.3) +
      0.9 * Math.exp(-Math.pow((ph - 0.34) / 0.012, 2)) -
      0.3 * Math.exp(-Math.pow((ph - 0.37) / 0.014, 2))
    );
  }
  let e = 0;
  e += 0.16 * Math.exp(-Math.pow((ph - 0.14) / 0.045, 2)); // P
  e -= 0.3 * Math.exp(-Math.pow((ph - 0.27) / 0.012, 2)); // Q
  e += 1.0 * Math.exp(-Math.pow((ph - 0.3) / 0.011, 2)); // R
  e -= 0.42 * Math.exp(-Math.pow((ph - 0.335) / 0.014, 2)); // S
  e += 0.28 * Math.exp(-Math.pow((ph - 0.5) / 0.05, 2)); // T
  return e;
}

export default function EcgTrace({
  rhythm = "sinus",
  className = "",
  height = 190,
}: {
  rhythm?: Rhythm;
  className?: string;
  height?: number;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const cv = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = wrap.current;
    const canvas = cv.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, t = 0, raf = 0, visible = true;
    const beats = rhythm === "tachy" ? 4.2 : rhythm === "fib" ? 5.4 : 2.6;

    const size = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(host);

    const draw = () => {
      if (visible && !reduce) t += 0.0042;
      ctx.clearRect(0, 0, W, H);

      // graticule — ECG paper, at a different rate from the trace itself
      ctx.strokeStyle = "rgba(179,18,28,0.13)";
      ctx.lineWidth = 1;
      const g = 22;
      const off = reduce ? 0 : (t * 40) % g;
      ctx.beginPath();
      for (let x = -off; x < W; x += g) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = 0; y < H; y += g) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();

      // baseline
      const mid = H * 0.58;
      ctx.strokeStyle = "rgba(12,12,14,0.06)";
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

      // the trace
      const steps = Math.max(200, Math.floor(W / 2));
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const ph = ((u * beats - t) % 1 + 1) % 1;
        const y = mid - deflection(ph, rhythm) * (H * 0.34);
        const x = u * W;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#B3121C";
      ctx.lineWidth = 1.7;
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(179,18,28,0.4)";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    size();
    window.addEventListener("resize", size, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
    };
  }, [rhythm]);

  return (
    <div ref={wrap} className={className} style={{ height }} aria-hidden="true">
      <canvas ref={cv} className="block h-full w-full" />
    </div>
  );
}
