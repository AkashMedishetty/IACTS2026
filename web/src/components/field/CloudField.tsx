"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; z: number; ven: number; lum: number };

/**
 * The flyer-derived cardiac point cloud, rendered as glow on near-black.
 *
 * Two deliberate constraints, both learned the hard way:
 *  - Depth is DERIVED from position as a rounded shell, never random. Random z
 *    scatters the silhouette into a spray and it stops reading as a heart —
 *    fatal for an audience of cardiac surgeons.
 *  - Rotation is a ±11° sway, not a spin, so the anatomy stays legible.
 */
export default function CloudField({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const cv = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = wrap.current;
    const canvas = cv.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pts: Pt[] = [];
    let W = 0, H = 0, S = 1, t = 0, raf = 0, visible = true;
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

    const size = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; S = Math.min(W, H) / 620;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      ptr.tx = e.clientX / window.innerWidth - 0.5;
      ptr.ty = e.clientY / window.innerHeight - 0.5;
    };

    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(host);

    let alive = true;
    fetch("/heart-cloud.json")
      .then((r) => r.json())
      .then((d: { pts: [number, number, number, number][] }) => {
        if (!alive) return;
        pts = d.pts.map(([x, y, ven, lum]) => {
          const u = (x - 300) / 175;
          const shell =
            Math.cos(Math.max(-1.4, Math.min(1.4, u))) * 66 * (0.45 + Math.random() * 0.55);
          return {
            x: x - 300,
            y: y - 300,
            z: Math.random() < 0.5 ? -shell : shell,
            ven,
            lum,
          };
        });
      })
      .catch(() => { /* cloud is decorative; the hero text stands alone */ });

    const FOV = 700, CAM = 660;

    const draw = () => {
      if (visible && !reduce) t += 0.0022;
      ptr.x += (ptr.tx - ptr.x) * 0.06;
      ptr.y += (ptr.ty - ptr.y) * 0.06;

      ctx.clearRect(0, 0, W, H);
      const cx = W * 0.5 + ptr.x * 44;
      const cy = H * 0.5 + ptr.y * 28;

      // ±11° sway keeps the silhouette readable; depth still parallaxes
      const a = Math.sin(t * 2.6) * 0.19 + ptr.x * 0.16;
      const ca = Math.cos(a), sa = Math.sin(a);

      ctx.globalCompositeOperation = "lighter"; // glow, not paint
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x3 = p.x * ca + p.z * sa;
        const z3 = -p.x * sa + p.z * ca;
        const s = FOV / (CAM + z3);
        const depth = 0.5 + z3 / 150;
        const r = (0.34 + Math.max(0, depth) * 1.05) * Math.max(S, 0.45);
        ctx.beginPath();
        ctx.arc(cx + x3 * s * S, cy + p.y * s * S, r, 0, 6.2832);
        ctx.fillStyle = p.ven
          ? `rgba(104,158,204,${0.05 + depth * 0.3})`
          : p.lum > 0.42
            ? `rgba(232,58,68,${0.07 + depth * 0.46})`
            : `rgba(179,18,28,${0.06 + depth * 0.34})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    size();
    window.addEventListener("resize", size, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      <canvas ref={cv} className="block h-full w-full" />
    </div>
  );
}
