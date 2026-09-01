import type { Metadata } from "next";
import AnatomyLab from "@/components/anatomy/AnatomyLab";

export const metadata: Metadata = {
  title: "Anatomy Interaction R&D — IACTS 2026",
  description: "Technical prototype for scroll-driven cardiothoracic particle disassembly and reformation.",
  robots: { index: false, follow: false },
};

export default function AnatomyLabPage() {
  return <AnatomyLab />;
}