"""Prove the 10-page brochure lost NOTHING relative to the 21-page one.

Compressing pages is exactly where content quietly disappears, so this does not
spot-check headings: it walks EVERY slot title in data/programme.ts, every
roster name, every abstract rule and every fee, and asserts each appears in the
rendered PDF.

Letter-spaced CSS makes pdftotext emit fragmented, reordered tokens, so matching
is done on a whitespace-stripped haystack of the whole document.
"""
import re
import subprocess
import sys

PDF = "public/brochure/IACTS-TechnoCollege-CME-2026-Delegate-Brochure.pdf"
TS = "src/data/programme.ts"
CONF = "src/data/conference.ts"
CFG = "src/config/conference.config.ts"


def norm(s: str) -> str:
    return re.sub(r"\s+", "", s).lower()


text = subprocess.run(["pdftotext", PDF, "-"], capture_output=True, text=True).stdout
hay = norm(text)
pages = [p for p in text.split("\f") if p.strip()]
print(f"pages: {len(pages)}")

missing = []


def check(label: str, items):
    global missing
    gone = [i for i in items if norm(i) not in hay]
    status = "OK" if not gone else f"MISSING {len(gone)}"
    print(f"  {label:34s} {len(list(items)):3d} items  {status}")
    if gone:
        for g in gone[:6]:
            print(f"      - {g[:74]}")
        missing += gone


src = open(TS, encoding="utf-8").read()
# Every `title:` in the programme module — slots, sessions, stations, labs.
titles = re.findall(r'title:\s*"((?:[^"\\]|\\.)*)"', src)
titles = [t.replace('\\"', '"') for t in titles]
check("programme titles (all)", titles)

# Every named faculty member.
whos = re.findall(r'who:\s*"((?:[^"\\]|\\.)*)"', src)
check("faculty / who lines", sorted(set(whos)))

# CVTS 2035 topic + panel lists and signature formats.
for name in ("topics", "panel"):
    block = re.search(name + r":\s*\[(.*?)\]", src, re.S)
    if block:
        check(f"cvts2035 {name}", re.findall(r'"([^"]+)"', block.group(1)))

conf = open(CONF, encoding="utf-8").read()
exec_names = re.findall(r'\{\s*name:\s*"([^"]+)",\s*portrait', conf)
check("committee roster names", exec_names)

cfg = open(CFG, encoding="utf-8").read()
rules_block = re.search(r"submissionRules:\s*\[(.*?)\]", cfg, re.S)
if rules_block:
    check("abstract rules", re.findall(r'"([^"]+)"', rules_block.group(1)))

# Fees must all be printed.
fees = ["3,000", "5,000", "7,000", "9,000", "10,000", "12,000"]
check("fee amounts", fees)

print()
if missing:
    print(f"FAIL — {len(missing)} item(s) absent from the rendered PDF")
    sys.exit(1)
print("PASS — every programme title, faculty name, roster name, rule and fee is present")
