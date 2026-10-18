"""
IACTS TechnoCollege CME 2026 — abstract presentation templates.

    python scripts/abstract-templates/build.py <out_dir>
    (needs python-pptx; Pillow is used by python-pptx for the logo)

Builds two PowerPoint files, both 20 x 11.69 in and identical in layout — only
the presentation label differs ("Paper Presentation" / "Poster Presentation"):
a full-width header with the emblem, "IACTS TechnoCollege CME 2026", the theme,
the label, and the presenter details (presenter, authors, institution,
registration ID); then one open area for the content; then a footer.

The layout follows the society's earlier conference templates (header band,
three-column poster body, footer band) but is built here from nothing — no
shape, image or metadata is carried over from any other conference's file.
Branding is the event's only: its emblem, its name and theme, crimson and gold.
"""
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[2]  # web/
LOGO = ROOT / "public/brand/iacts-technocollege-2026-logo.png"

IVORY = RGBColor(0xF7, 0xF2, 0xEA)
GOLD = RGBColor(0xA9, 0x79, 0x3A)
GOLD_SOFT = RGBColor(0xE3, 0xD3, 0xB5)
CRIMSON = RGBColor(0xB3, 0x12, 0x2A)
DEEP = RGBColor(0x8B, 0x00, 0x00)
INK = RGBColor(0x17, 0x12, 0x0F)
GREY = RGBColor(0x6E, 0x6A, 0x62)
HINT = RGBColor(0x9A, 0x94, 0x84)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
PAPER = RGBColor(0xFB, 0xF7, 0xF0)

HEAD = "Arial Black"  # heavy sans, close to the logo's lettering, on every Office install
BODY = "Calibri"

W, H = 20.0, 11.69


def rect(slide, x, y, w, h, fill=None, line=None, dash=False, shape=MSO_SHAPE.RECTANGLE):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(1.25)
        if dash:
            from pptx.enum.dml import MSO_LINE_DASH_STYLE
            s.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    s.shadow.inherit = False
    return s


def hline(slide, x1, y, x2, color=GOLD, width=1.25):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y), Inches(x2), Inches(y))
    c.line.color.rgb = color
    c.line.width = Pt(width)
    return c


def vline(slide, x, y1, y2, color=GOLD, width=1.25):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x), Inches(y1), Inches(x), Inches(y2))
    c.line.color.rgb = color
    c.line.width = Pt(width)
    return c


def text(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None):
    """runs: list of paragraphs; each paragraph is a list of (text, font, size, color, bold, italic)."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.06)
    tf.margin_top = tf.margin_bottom = Inches(0.02)
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if spacing:
            p.space_after = Pt(spacing)
        for t, font, size, color, bold, italic in para:
            r = p.add_run()
            r.text = t
            r.font.name = font
            r.font.size = Pt(size)
            r.font.color.rgb = color
            r.font.bold = bold
            r.font.italic = italic
    return tb


def new_deck(title):
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    cp = prs.core_properties
    cp.title = title
    cp.author = "IACTS TechnoCollege CME 2026"
    cp.last_modified_by = "IACTS TechnoCollege CME 2026"
    cp.subject = "IACTS TechnoCollege CME 2026 — Hyderabad, 23–25 October 2026"
    cp.keywords = "IACTS, TechnoCollege, CME 2026, abstract, template"
    cp.comments = ""
    cp.category = "Abstract presentation template"
    blank = prs.slide_layouts[6]
    return prs, prs.slides.add_slide(blank)


def emblem_png():
    """The emblem alone (heart, lungs, ring) — the logo minus its wordmark, which
    the header now sets as live text at full width. Cut at the thin gold rule
    that separates the two in the logo."""
    import io
    from PIL import Image
    im = Image.open(LOGO).convert("RGBA")
    a = im.getchannel("A")
    w, h = im.size
    # The emblem ends where the first run of fully transparent columns begins
    # (between the ring's right tick mark and the gold rule).
    empty = [all(a.getpixel((x, y)) < 16 for y in range(0, h, 2)) for x in range(w)]
    cut, run = None, 0
    for x in range(int(w * 0.2), int(w * 0.7)):
        run = run + 1 if empty[x] else 0
        if run >= 4:
            cut = x - run + 1
            break
    em = im.crop((0, 0, cut or int(w * 0.45), h))
    em = em.crop(em.getbbox())
    buf = io.BytesIO()
    em.save(buf, "PNG")
    buf.seek(0)
    return buf, em.size


HEADER_H = 2.35


def field(slide, x, y, w, label, hint):
    """One presenter-detail line: label, then a click-to-edit placeholder."""
    text(slide, x, y, w, 0.42, [[(label + "  ", BODY, 14, CRIMSON, True, False), (hint, BODY, 14, HINT, False, True)]],
         anchor=MSO_ANCHOR.MIDDLE)
    hline(slide, x + 0.06, y + 0.42, x + w, color=GOLD_SOFT, width=1)


def template(out: Path, kind: str):
    """Paper and poster share one layout; only the presentation label differs."""
    prs, s = new_deck(f"IACTS TechnoCollege CME 2026 — {kind} Presentation Template")
    # header band, full width
    rect(s, 0, 0, W, HEADER_H, fill=IVORY)
    buf, (ew, eh) = emblem_png()
    em_h = 1.95
    s.shapes.add_picture(buf, Inches(0.4), Inches((HEADER_H - em_h) / 2), height=Inches(em_h))
    em_w = em_h * ew / eh
    x0 = 0.4 + em_w + 0.25
    vline(s, x0, 0.35, HEADER_H - 0.35)
    tx = x0 + 0.22
    text(s, tx, 0.22, 9.3, 0.8, [[
        ("IACTS ", HEAD, 29, CRIMSON, False, False),
        ("TECHNOCOLLEGE ", HEAD, 29, INK, False, False),
        ("CME ", HEAD, 29, CRIMSON, False, False),
        ("2026", HEAD, 29, GOLD, False, False),
    ]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, tx, 0.98, 9.3, 0.42, [[("THE FUTURE IS NOW", BODY, 17, GOLD, True, False)]], anchor=MSO_ANCHOR.MIDDLE)
    badge = rect(s, tx + 0.06, 1.52, 4.1, 0.5, fill=CRIMSON, shape=MSO_SHAPE.ROUNDED_RECTANGLE)
    badge.adjustments[0] = 0.5
    text(s, tx + 0.06, 1.52, 4.1, 0.5, [[(f"{kind.upper()} PRESENTATION", HEAD, 15, WHITE, False, False)]],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    # presenter details, right of the title
    fx, fw = 12.25, 7.35
    vline(s, fx - 0.25, 0.35, HEADER_H - 0.35, color=GOLD_SOFT, width=1)
    field(s, fx, 0.2, fw, "Presenter:", "click to add the presenting author")
    field(s, fx, 0.7, fw, "Author(s):", "click to add all authors")
    field(s, fx, 1.2, fw, "Institution:", "click to add the institution")
    field(s, fx, 1.7, fw, "Registration ID:", "click to add your IACTS registration ID")
    hline(s, 0, HEADER_H, W)
    hline(s, 0, HEADER_H + 0.04, W)
    # the rest of the slide is one open area for the presentation itself
    # footer
    rect(s, 0, 11.12, W, 0.57, fill=IVORY)
    hline(s, 0, 11.12, W)
    hline(s, 0, 11.16, W)
    text(s, 0, 11.2, W, 0.45, [[
        ("IACTS TechnoCollege CME 2026", BODY, 13, CRIMSON, True, False),
        ("     ·     iactstechnocollegecme2026.com", BODY, 12, GREY, False, True),
    ]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    prs.save(out)


if __name__ == "__main__":
    out_dir = Path(sys.argv[1] if len(sys.argv) > 1 else ".").expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    template(out_dir / "IACTS_TechnoCollege_2026_Paper_Template.pptx", "Paper")
    template(out_dir / "IACTS_TechnoCollege_2026_Poster_Template.pptx", "Poster")
    print("wrote", out_dir / "IACTS_TechnoCollege_2026_Paper_Template.pptx")
    print("wrote", out_dir / "IACTS_TechnoCollege_2026_Poster_Template.pptx")
