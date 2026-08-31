"use client";

import { useEffect, useRef, useState } from "react";

export type BandMode = "basal" | "apical" | "twist";

type Ring = {
  vy: number[];
  ex: number[];
  radius: number;
  yOff: number;
  spin: number;
  angle: number;
  harm: number;
};

/**
 * Torrent-Guasp's helical ventricular myocardial band — the ventricular
 * myocardium as one continuous muscle band coiled in a double helix
 * (JTCVS; outer basal loop of transverse fibres wrapping an inner apical
 * helical loop whose oblique segments form a conical apical vortex).
 *
 * The three modes are therefore real cardiac configurations, not invented
 * topologies, which is the whole reason this hero is credible to surgeons.
 */
export default function HelicalBand({
  mode,
  className = "",
}: {
  mode: BandMode;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const cv = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<BandMode>(mode);
  const [, setReady] = useState(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const host = wrap.current;
    const canvas = cv.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const RINGS = 26, PER = 104;
    let rings: Ring[] = [];
    let W = 0, H = 0, t = 0, raf = 0, visible = true;
    const ptr = { x: -3000, y: -3000, tx: -3000, ty: -3000, r: 230 };
    const tr = { p: 1, from: mode, to: mode };
    let shown: BandMode = mode;

    const build = () => {
      rings = [];
      for (let r = 0; r < RINGS; r++) {
        const f = r / RINGS;
        rings.push({
          vy: new Array(PER).fill(0),
          ex: new Array(PER).fill(0),
          radius: Math.min(W, H) * 0.33 * (0.42 + f * 0.58),
          yOff: (f - 0.5) * (H * 0.42),
          spin: (r % 2 ? -1 : 1) * (0.0018 + f * 0.0024),
          angle: (r * Math.PI) / RINGS,
          harm: r * 0.2,
        });
      }
    };

    const size = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      ptr.tx = e.clientX - b.left;
      ptr.ty = e.clientY - b.top;
    };
    const onLeave = () => { ptr.tx = -3000; ptr.ty = -3000; };

    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(host);

    const FOV = 620, CAM = 560;

    /* basal  — outer basal loop, transverse fibres encircling both ventricles
       apical — inner apical loop descending into the conical apical vortex
       twist  — systolic torsion: base and apex counter-rotate (wringing) */
    const place = (m: BandMode, th: number, ring: Ring) => {
      let x = Math.cos(th) * ring.radius;
      let z = Math.sin(th) * ring.radius;
      let y = ring.yOff;
      if (m === "basal") {
        y += Math.sin(th * 2 + t * 1.8 + ring.harm) * 36;
      } else if (m === "apical") {
        const taper = 0.42 + 0.58 * (1 - (ring.yOff / (H * 0.42) + 0.5));
        x *= taper; z *= taper;
        y += Math.cos(th * 3 + t * 1.15) * 28 + Math.sin(t * 0.9 + ring.harm) * 13;
      } else {
        const a2 = th + (ring.yOff / (H * 0.42)) * 1.5 * Math.sin(t * 1.25) * 1.15;
        x = Math.cos(a2) * ring.radius * (1 + Math.sin(th * 4 + t) * 0.12);
        z = Math.sin(a2) * ring.radius;
        y += Math.sin(t * 1.4 + ring.harm) * 25;
      }
      return { x, y, z };
    };

    const draw = () => {
      if (modeRef.current !== shown) {
        tr.p = 0; tr.from = shown; tr.to = modeRef.current; shown = modeRef.current;
      }
      if (visible && !reduce) {
        t += 0.012;
        if (tr.p < 1) tr.p = Math.min(1, tr.p + 0.045);
      } else if (tr.p < 1) {
        tr.p = 1; // reduced motion snaps to the new state rather than freezing mid-morph
      }
      ptr.x += (ptr.tx - ptr.x) * 0.1;
      ptr.y += (ptr.ty - ptr.y) * 0.1;

      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const e = tr.p < 0.5 ? 2 * tr.p * tr.p : -1 + (4 - 2 * tr.p) * tr.p;

      ctx.globalCompositeOperation = "multiply"; // light system: additive would erase the band on white
      for (const ring of rings) {
        if (visible && !reduce) ring.angle += ring.spin;
        let fx = 0, fy = 0, exSum = 0, zSum = 0;
        ctx.beginPath();
        for (let p = 0; p < PER; p++) {
          const th = (p / PER) * Math.PI * 2 + ring.angle;
          const A = place(tr.from, th, ring);
          const B = place(tr.to, th, ring);
          const x3 = A.x + (B.x - A.x) * e;
          const y3 = A.y + (B.y - A.y) * e;
          const z3 = A.z + (B.z - A.z) * e;
          zSum += z3;
          const s = FOV / (CAM + z3);
          const px = cx + x3 * s;
          const py = cy + (y3 + ring.vy[p]) * s;

          const d = Math.hypot(px - ptr.x, py - ptr.y);
          if (d < ptr.r) {
            const k = 1 - d / ptr.r;
            ring.vy[p] += (Math.sin(th + t) * k * 15 - ring.vy[p]) * 0.1;
            ring.ex[p] = Math.max(ring.ex[p], k);
          } else ring.vy[p] *= 0.92;
          ring.ex[p] *= 0.93;
          exSum += ring.ex[p];

          if (p === 0) { fx = px; fy = py; ctx.moveTo(px, py); } else ctx.lineTo(px, py);
        }
        ctx.lineTo(fx, fy);
        const ex = exSum / PER;
        // depth falloff: front fibres read bright, rear ones recede. A flat
        // alpha made the whole band look like one faint cone.
        const zAvg = zSum / PER;
        const near = Math.max(0, Math.min(1, 0.5 + zAvg / (ring.radius * 1.6 || 1)));
        if (ex > 0.05) {
          ctx.strokeStyle = `rgba(163,12,22,${Math.min(1, 0.6 + ex * 0.4)})`;
          ctx.lineWidth = 1.3 + ex * 1.7;
        } else {
          ctx.strokeStyle = `rgba(150,16,26,${0.16 + near * 0.55})`;
          ctx.lineWidth = 0.7 + near * 0.75;
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    size();
    setReady(true);
    window.addEventListener("resize", size, { passive: true });
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      <canvas ref={cv} className="block h-full w-full" />
    </div>
  );
}
