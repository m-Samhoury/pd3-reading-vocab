"""Phase 1.2 – extract raw text from every in-scope reading PDF.

pdfminer's layout analysis (LAParams) is used instead of plain pdfplumber text
because the reading booklets are set in two columns; layout analysis keeps each
column's lines together. Line-break hyphenation ("om-\nkring") is joined.
Output: work/raw/<exam>_<booklet>.txt  (pages separated by \f)
"""
import glob, os, re, unicodedata
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams

from paths import EXAMS as ROOT, WORK
SITTINGS = {"2022 nov dec": "2022v", "2023 maj juni": "2023s",
            "2023 nov dec": "2023v", "2024 maj juni": "2024s"}


def booklet(name):
    n = unicodedata.normalize("NFC", name).lower()
    if "censor" in n:
        return "censor"
    part = "L1" if "læseforståelse 1" in n else "L2" if "læseforståelse 2" in n else None
    if part is None:
        return None
    kind = "opg" if "opgave" in n else "txt"
    return f"{part}_{kind}"


def clean(t):
    t = t.replace("­", "")                      # soft hyphen
    t = re.sub(r"(\w)-\s*\n\s*(\w)", lambda m: m.group(1) + m.group(2)
               if m.group(2).islower() else m.group(0), t)
    t = re.sub(r"[ \t]+", " ", t)
    return t


def main():
    out = os.path.join(WORK, "raw")
    os.makedirs(out, exist_ok=True)
    for folder, code in SITTINGS.items():
        for f in sorted(glob.glob(os.path.join(ROOT, folder, "1 reading", "*.pdf"))):
            b = booklet(os.path.basename(f))
            if not b:
                continue
            t = unicodedata.normalize("NFC", clean(extract_text(f, laparams=LAParams(boxes_flow=0.5))))
            dst = os.path.join(out, f"{code}_{b}.txt")
            with open(dst, "w", encoding="utf-8") as o:
                o.write(t)
            print(f"{code}_{b:7s} {len(t):6d} chars  <- {os.path.basename(f)}")


if __name__ == "__main__":
    main()
