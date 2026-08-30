# Three Concept Directions

House rule: a concept is a **device**, not a style. Each of these has a different
feeling, a different governing mechanic, and a different interaction model —
they are not three shades of one idea.

Shared foundation for all three: the heart geometry is **real**. Verified source
is the NIH 3D "Heart Library" — clinically accurate hearts reconstructed
*directly from patient MRI data*, built with Jump Simulation, per-model licence
filterable. Fallback: Z-Anatomy (CC BY-SA 4.0) for ribcage/thorax.
That provenance is the site's honesty backbone in all three directions.

---

## Direction 1 — THE OPERATIVE FIELD ★ recommended

**One sentence:** The site is a surgical field under theatre light — bone-white,
brilliantly lit, instruments laid out with obsessive precision — and the scroll
*is* the operation: approach, exposure, repair, closure.

**Ideology:** Cardiothoracic surgery's real aesthetic is not sci-fi glow, it is
*sterile clarity under brilliant light*. Surgeons live in a bright, high-contrast,
ruthlessly organised visual world. So the site is light — bone field, crimson as
incision, gold as instrument brass. This is the only direction derived from what
the audience actually sees every day.

**The signature moment:** a real MRI-derived heart sits in the field. As you
scroll, the site performs a controlled dissection — the ribcage retracts, the
epicardium goes translucent, the chambers separate, the conduction pathway
lights up. Each stage of the dissection anchors one section of the programme.
Scroll position = surgical sequence.

**Mechanic (implementation terms):** one R3F canvas. Camera on a fixed cinematic
spline; scroll *biases* progress along a dissection timeline that drives three
things — clipping-plane position, epicardial material transmission, and emissive
intensity on conduction-pathway curves. Parallax is depth-layered SVG (scan arcs,
ECG trace, Hyderabad skyline) moving at differential rates over the canvas, so
the parallax is real depth rather than a decorative translate.

**Type:** set like an operative note — precise, tabular numerals, ruled, dense.

**Why it wins:** light reads instantly non-generic; "THE FUTURE IS NOW" gets a
literal reading (patient-specific 3D reconstruction *is* the future, and it is
already here); and it is honest, because the heart is real data.

**Risk:** dissection imagery must stay clinical, never gory. Mitigation: it is
already the visual language of their own brochure callouts.

---

## Direction 2 — THE SIGNAL

**One sentence:** The whole site is one continuous ECG trace — a single unbroken
line that draws itself from the first pixel to the last, and every section of
the conference is a complication in the rhythm.

**Ideology:** The one image every cardiac surgeon reads instantly and
involuntarily is the trace. Make the line the entire navigation, structure and
motion system — a constraint taken to an extreme.

**Mechanic:** an SVG/canvas polyline whose path length maps to scroll length;
the viewport rides along it. Sections are *morphologies* — normal sinus for the
intro, a tall QRS spike for the keynote, fibrillation for the panel debates, a
flatline-then-restart for the closing. The 3D heart appears exactly once, at the
restart, beating in time with the trace. Parallax = graticule paper scrolling
behind the line at a different rate.

**Why it could win:** the most conceptually pure and the most screenshot-able.
One idea, ruthlessly applied.

**Risk (real):** may read gimmicky to a senior committee, and a one-line concept
is hard to keep legible across content-heavy pages — registration tables,
faculty grids, abstract rules. Legibility is the failure mode.

---

## Direction 3 — ATLAS OF THE THORAX

**One sentence:** The site is a modern anatomical atlas — a book of plates where
the interaction is turning and overlaying transparent anatomical sheets, the way
Gray's and Netter's overlays worked.

**Ideology:** Reaches back to the great tradition of anatomical illustration and
rebuilds it in WebGL. Deeply credible with senior surgeons, editorial, and the
gold/bone palette is exactly right for it. "The future is now" reads as: the
atlas is no longer a book, it is live volumetric data.

**Mechanic:** each section is a registered "plate" that overlays with controlled
transparency. The 3D element is a scrubbable CT-slice stack — dragging moves
through axial slices, and the slices assemble into the 3D heart. Engraved labels
with leader lines, which the brochure already does.

**Why it could win:** the safest bet with the senior cohort, and the most
beautiful in stills.

**Risk:** reads historical/academic rather than "FUTURE IS NOW". Least kinetic
of the three — weakest on the "very interactive" requirement.

---

## Recommendation

**Direction 1**, borrowing Direction 3's engraved leader-line labelling for the
callouts. That combination gets the kinetic interactivity asked for, keeps senior
credibility, and is the only one whose concept and whose asset provenance are the
same idea.
