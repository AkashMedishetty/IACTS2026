import type { Metadata } from "next";

/* The page itself is a client component, so its metadata has to live here —
   "metadata" cannot be exported from a "use client" module. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RenderPlateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
