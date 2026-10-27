"""Den Danske Ordbog lookup (ordnet.dk/ddo) with a local HTML cache.

Used only to verify lemma existence, word class and the inventory of senses.
DDO's wording is never copied into the deliverables; definitions are written
independently and checked against this sense list.
"""
import html, json, os, re, subprocess, sys, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
from paths import WORK  # noqa: E402
CACHE = os.path.join(WORK, "ddo_cache")
os.makedirs(CACHE, exist_ok=True)


def _fetch(query, select=None):
    key = re.sub(r"[^\wæøå]+", "_", query.lower()) + (f"__{select}" if select else "")
    path = os.path.join(CACHE, key + ".html")
    if os.path.exists(path):
        return open(path, encoding="utf-8").read()
    url = "https://ordnet.dk/ddo/ordbog?query=" + urllib.parse.quote(query)
    if select:
        url += "&select=" + urllib.parse.quote(select)
    r = subprocess.run(["curl", "-sSL", "-A", "Mozilla/5.0 (PD3 study tool)", url],
                       capture_output=True, text=True, timeout=60)
    time.sleep(0.8)
    with open(path, "w", encoding="utf-8") as f:
        f.write(r.stdout)
    return r.stdout


def _text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def parse(page):
    title = re.search(r"<title>(.*?) \| Den Danske Ordbog</title>", page)
    pos = re.findall(r'class="part-of-speech"[^>]*>(.*?)</', page, re.S)
    senses = []
    for block in re.split(r'class="modern-sense-block"', page)[1:]:
        no = re.search(r'class="modern-senseno"[^>]*>(.*?)</', block, re.S)
        d = re.search(r'class="modern-definition"[^>]*>(.*?)</div>', block, re.S)
        syn = re.findall(r'class="modern-label-inline modern-onym"[^>]*>(.*?)</div>', block, re.S)
        if d:
            senses.append({"no": _text(no.group(1)) if no else "", "def": _text(d.group(1)),
                           "onym": [_text(x) for x in syn][:3]})
    # one page holds every homograph / fixed expression as its own article
    articles = []
    for art in re.split(r'<h1 class="modern-match">', page)[1:]:
        head = _text(art[:art.find("</h1>")])
        p = re.search(r'class="part-of-speech"[^>]*>(.*?)</', art, re.S)
        defs = [_text(d) for d in re.findall(r'class="modern-definition"[^>]*>(.*?)</div>', art, re.S)]
        articles.append({"head": head, "pos": _text(p.group(1)) if p else "", "defs": defs})
    return {"title": _text(title.group(1)) if title else None,
            "pos": [_text(p) for p in pos][:3], "senses": senses, "articles": articles,
            "found": bool(title) and "Ingen resultater" not in page}


def page_text(query):
    """Plain text of the cached page – used to confirm that a fixed expression is listed."""
    return _text(re.sub(r"<script.*?</script>", "", _fetch(query), flags=re.S))


def lookup(query, select=None):
    return parse(_fetch(query, select))


if __name__ == "__main__":
    for q in sys.argv[1:]:
        print(json.dumps(lookup(q), ensure_ascii=False, indent=1))
