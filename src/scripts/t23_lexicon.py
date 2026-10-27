"""Write class / forms / DDO query / source into src/lexicon/tier2_*.txt and tier3_*.txt from WORK/t23_facts.json.

Run after t23_facts.py; it only fills meta lines that are missing, so hand edits are kept.
"""
import glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B   # noqa: E402

F = json.load(open(os.path.join(B.WORK, "t23_facts.json"), encoding="utf-8"))


def meta_for(lemma):
    f = F[lemma]
    out = {"class": f["class"], "forms": ", ".join(f["forms"])}
    if f["query"] != lemma:
        out["ddo"] = f["query"]
    if f["source"] == "guide":
        out["source"] = "guide"
    return out


def main():
    for path in sorted(glob.glob(os.path.join(B.LEX, "tier2_*.txt")) + glob.glob(os.path.join(B.LEX, "tier3_*.txt"))):
        lines = open(path, encoding="utf-8").read().splitlines()
        out, i = [], 0
        while i < len(lines):
            line = lines[i]
            out.append(line)
            i += 1
            if line.startswith("@ "):
                have = set()
                j = i
                while j < len(lines) and lines[j].strip() and not lines[j].startswith(("S: ", "@ ")):
                    have.add(lines[j].split(":")[0].strip())
                    j += 1
                for k, v in meta_for(line[2:].strip()).items():
                    if k not in have:
                        out.append(f"{k}: {v}")
        open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")
        print("updated", os.path.basename(path))


if __name__ == "__main__":
    main()
