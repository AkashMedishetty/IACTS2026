"""
IACTS TechnoCollege CME 2026 — abstract presentation templates.

    python scripts/abstract-templates/build.py <out_dir>
    (needs python-pptx; Pillow is used by python-pptx for the logo)

Builds two PowerPoint files, both 20 x 11.69 in:
  IACTS_TechnoCollege_2026_Paper_Template.pptx   framed slide for paper/video talks
  IACTS_TechnoCollege_2026_Poster_Template.pptx  e-poster with IMRaD sections

The layout follows the society's earlier conference templates (header band,
three-column poster body, footer band) but is built here from nothing — no
shape, image or metadata is carried over from any other conference's file.
Branding is IACTS: the event logo, the association seal, crimson and gold.
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
SEAL = ROOT / "public/logo/iacts-mark.png"

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


def frame(slide, label):
    """Header band, double gold rule, footer band — shared by both templates."""
    rect(slide, 0, 0, W, 2.0, fill=IVORY)
    # event logo (transparent PNG), left
    logo_h = 1.62
    slide.shapes.add_picture(str(LOGO), Inches(0.45), Inches(0.19), height=Inches(logo_h))
    vline(slide, 3.98, 0.35, 1.65)
    text(slide, 4.2, 0.28, 8.2, 1.5, [
        [("INDIAN ASSOCIATION OF CARDIOVASCULAR-THORACIC SURGEONS", BODY, 12, GOLD, True, False)],
        [(label, HEAD, 30, CRIMSON, False, False)],
        [("Department of CTVS, Nizam’s Institute of Medical Sciences, Hyderabad", BODY, 14, INK, False, True)],
    ], spacing=2)
    # association seal + dates, right
    slide.shapes.add_picture(str(SEAL), Inches(19.02), Inches(0.18), height=Inches(0.62))
    text(slide, 11.4, 0.9, 8.15, 0.5, [[("OCTOBER 23 – 25, 2026", HEAD, 20, CRIMSON, False, False)]], align=PP_ALIGN.RIGHT)
    text(slide, 11.4, 1.38, 8.15, 0.45, [[("NIMS  ·  Dr. MCR HRD Institute Auditorium, Hyderabad", BODY, 14, INK, False, False)]], align=PP_ALIGN.RIGHT)
    hline(slide, 0, 2.0, W)
    hline(slide, 0, 2.04, W)
    # footer
    rect(slide, 0, 11.12, W, 0.57, fill=IVORY)
    hline(slide, 0, 11.12, W)
    hline(slide, 0, 11.16, W)
    text(slide, 0, 11.2, W, 0.45, [[
        ("iactstechnocollegecme2026.com", BODY, 13, CRIMSON, True, False),
        ("     ·     Indian Association of Cardiovascular-Thoracic Surgeons     ·     IACTS TechnoCollege CME 2026", BODY, 12, GREY, False, True),
    ]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


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


def section(slide, x, y, w, title):
    rect(slide, x, y, w, 0.42, fill=CRIMSON)
    rect(slide, x, y, 0.4, 0.42, fill=GOLD)
    text(slide, x + 0.4, y, w - 0.4, 0.42, [[(title, HEAD, 15, WHITE, False, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def hint(slide, x, y, w, h, paras):
    text(slide, x, y, w, h, [[(p, BODY, 12, GREY, False, True)] for p in paras], spacing=8)


def paper(out: Path):
    prs, s = new_deck("IACTS TechnoCollege CME 2026 — Paper Presentation Template")
    frame(s, "Scientific Paper Presentation")
    prs.save(out)


def poster(out: Path):
    prs, s = new_deck("IACTS TechnoCollege CME 2026 — E-Poster Template")
    frame(s, "E-Poster Presentation")
    text(s, 0.55, 2.09, 18.9, 0.42, [[
        ("POSTER TITLE:  ", HEAD, 17, CRIMSON, False, False),
        ("double-click to add your abstract / poster title", BODY, 17, HINT, False, True),
    ]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.55, 2.5, 18.9, 0.3, [[
        ("Presenter: ", BODY, 12.5, DEEP, True, False), ("________________      ", BODY, 12.5, HINT, False, False),
        ("Registration ID: ", BODY, 12.5, DEEP, True, False), ("____________      ", BODY, 12.5, HINT, False, False),
        ("Abstract ID: ", BODY, 12.5, DEEP, True, False), ("________________      ", BODY, 12.5, HINT, False, False),
        ("Institution: ", BODY, 12.5, DEEP, True, False), ("________________________", BODY, 12.5, HINT, False, False),
    ]])
    hline(s, 0, 2.85, W)
    vline(s, 6.77, 2.98, 11.02, color=GOLD_SOFT, width=1)
    vline(s, 13.23, 2.98, 11.02, color=GOLD_SOFT, width=1)

    # column 1
    section(s, 0.5, 2.98, 6.07, "INTRODUCTION")
    hint(s, 0.56, 3.5, 5.95, 1.65, ["Provide the background and rationale. Describe the clinical problem, the relevant anatomy or physiology, and the gap your study or case addresses."])
    section(s, 0.5, 5.35, 6.07, "AIM & OBJECTIVES")
    hint(s, 0.56, 5.87, 5.95, 0.95, ["State the primary aim and any secondary objectives or hypotheses of the work in one or two lines."])
    section(s, 0.5, 7.05, 6.07, "MATERIALS & METHODS")
    hint(s, 0.56, 7.57, 5.95, 3.3, [
        "Outline study design, setting and time-frame; patient or sample selection with inclusion and exclusion criteria; the surgical technique or intervention; outcome measures; and statistical analysis.",
        "For a case report, describe the presentation, examination findings and investigations performed.",
    ])
    # column 2
    section(s, 6.97, 2.98, 6.07, "RESULTS")
    hint(s, 7.03, 3.5, 5.95, 1.45, ["Report the key findings with numbers, outcome measures and any statistics (p-values, confidence intervals). Refer to the figure(s) below."])
    rect(s, 6.97, 5.15, 6.07, 5.05, fill=PAPER, line=GOLD, dash=True)
    text(s, 6.97, 7.05, 6.07, 0.7, [[("+", BODY, 44, GOLD, True, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 6.97, 7.7, 6.07, 0.4, [[("Insert figure / clinical image here", BODY, 13, HINT, False, False)]], align=PP_ALIGN.CENTER)
    text(s, 7.03, 10.24, 5.95, 0.4, [[("Figure. ", BODY, 10.5, DEEP, True, False), ("Add a short caption describing the image.", BODY, 10.5, HINT, False, True)]])
    # column 3
    section(s, 13.43, 2.98, 6.07, "DISCUSSION")
    hint(s, 13.49, 3.5, 5.95, 3.0, [
        "Interpret your findings and set them against the existing literature. Explain the mechanism or reasoning, highlight the clinical relevance, and acknowledge the strengths and limitations of the work.",
        "(About 180–220 words.)",
    ])
    section(s, 13.43, 6.7, 6.07, "CONCLUSION")
    hint(s, 13.49, 7.22, 5.95, 1.8, ["State the single most important take-home message and its clinical implication in two or three sentences."])
    section(s, 13.43, 9.2, 6.07, "REFERENCES")
    hint(s, 13.49, 9.72, 5.95, 1.2, ["1.  Author AB, Author CD, et al. Title of the article. Journal. Year;Vol(Issue):pages.", "2.  …"])
    prs.save(out)


if __name__ == "__main__":
    out_dir = Path(sys.argv[1] if len(sys.argv) > 1 else ".").expanduser()
    out_dir.mkdir(parents=True, exist_ok=True)
    paper(out_dir / "IACTS_TechnoCollege_2026_Paper_Template.pptx")
    poster(out_dir / "IACTS_TechnoCollege_2026_Poster_Template.pptx")
    print("wrote", out_dir / "IACTS_TechnoCollege_2026_Paper_Template.pptx")
    print("wrote", out_dir / "IACTS_TechnoCollege_2026_Poster_Template.pptx")
