#!/usr/bin/env python3
"""Daily check of the university data against the official sources.

  python3 scripts/uni-check/check.py curricula [--limit 15] [--keys uni/bachelor,...] [--update-dates]
  python3 scripts/uni-check/check.py costs     [--limit 15] [--keys uni,...]          [--update-dates]

curricula: for each programme (oldest checkedOn first, missing sources first) it
downloads the official pages listed in app/data/bachelorSources.ts and looks for
every course name on our page in their text (ignoring case, accents, punctuation
and line breaks). Generic names (Electives, Thesis, ...) do not count.

costs: for each university it downloads the pages listed in app/data/costSources.ts
and looks for the amounts written in our tuition / livingCost strings.

A programme or cost PASSES when every checked item is found. With --update-dates
the checkedOn of passing entries is set to today; nothing else is ever changed
automatically. Everything else is printed as a to-do with the missing items:
  NEEDS-BROWSER  the page could not be read here (blocked, JavaScript, error):
                 open it in the browser and compare by hand
  MISMATCH       the page was read but some of our items are not on it:
                 the curriculum / fee may have changed, find the current version
  NO-SOURCE      no source documented yet
The full result is also written to scripts/uni-check/.cache/report-<date>.json.

Needs: python3, curl, pdftotext (brew install poppler), npx tsx.
"""
import datetime, hashlib, json, os, re, subprocess, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "scripts", "uni-check")
CACHE = os.path.join(HERE, ".cache")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
GENERIC = re.compile(r"^(electives?|free electives?|optional courses|optativas|optional modules|thesis|bachelor s thesis|bachelor thesis|"
                     r"bachelorarbeit|minor|internship|guidance|specializations?|major course|major seminar|career skills|statistics|"
                     r"mathematics|finance|marketing|accounting|ethics|microeconomics|macroeconomics|research design|economics|management|"
                     r"elective course|elective module|trabajo final de grado|examensarbete|kandidatuppsats)$")


def today_str():
    d = datetime.date.today()
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower().replace("&", " and ").replace("­", "")
    s = re.sub(r"[‐-―\-–—:;,.()'’\"/]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def squeeze(s):
    return re.sub(r"[^0-9a-z]", "", norm(s))


def load_data():
    os.makedirs(CACHE, exist_ok=True)
    out = os.path.join(CACHE, "export.json")
    subprocess.run(["npx", "tsx", os.path.join(HERE, "export.mts"), out], cwd=ROOT, check=True)
    return json.load(open(out))


def fetch(url):
    """Return (status, text). Cached for the day."""
    day = datetime.date.today().isoformat()
    h = hashlib.md5(url.encode()).hexdigest()
    base = os.path.join(CACHE, day, h)
    os.makedirs(os.path.dirname(base), exist_ok=True)
    if os.path.exists(base + ".txt"):
        return open(base + ".status").read(), open(base + ".txt", errors="ignore").read()
    raw = base + ".raw"
    r = subprocess.run(["curl", "-sL", "--compressed", "-m", "45", "-A", UA, "-o", raw, "-w", "%{http_code}", url],
                       capture_output=True, text=True)
    status = r.stdout.strip() or "000"
    text = ""
    if os.path.exists(raw):
        head = open(raw, "rb").read(5)
        if head.startswith(b"%PDF"):
            for mode in ("-layout", "-raw"):
                p = subprocess.run(["pdftotext", mode, raw, "-"], capture_output=True, text=True)
                text += "\n" + p.stdout
        else:
            p = subprocess.run([sys.executable, "-I", os.path.join(HERE, "htmltext.py"), raw], capture_output=True, text=True)
            text = p.stdout
        os.remove(raw)
    open(base + ".status", "w").write(status)
    open(base + ".txt", "w").write(text)
    return status, text


def readable(status, text):
    return status.startswith("2") and len(text) > 1500


def date_key(s):
    try:
        d, m, y = s.split()
        return (int(y), MONTHS.index(m) + 1, int(d))
    except Exception:
        return (0, 0, 0)


def update_dates(path, keys, field_re):
    """Set checkedOn to today in the entries of `keys` inside a TS data file."""
    src = open(path).read()
    for k in keys:
        i = src.find(f'  "{k}": {{')
        if i < 0:
            i = src.find(f"  {k}: {{")
        if i < 0:
            continue
        j = src.find("\n  },", i)
        block = re.sub(field_re, lambda m: m.group(1) + today_str() + '"', src[i:j])
        src = src[:i] + block + src[j:]
    open(path, "w").write(src)


def pick(keys_all, dates, limit, only):
    if only:
        return [k for k in only if k in keys_all]
    return sorted(keys_all, key=lambda k: date_key(dates.get(k, "")))[:limit]


def check_curricula(data, limit, only, write):
    progs = {f"{u['id']}/{b['id']}": b for u in data["universities"] for b in u["bachelors"] if b["courses"]}
    srcs = data["bachelorSources"]
    dates = {k: srcs[k]["checkedOn"] for k in srcs}
    results = []
    for key in pick(list(progs), dates, limit, only):
        names = [c["name"] for c in progs[key]["courses"]]
        core = [n for n in names if not GENERIC.match(norm(n))] or names
        if key not in srcs:
            results.append({"key": key, "state": "NO-SOURCE", "missing": core})
            continue
        text, unread = "", []
        for s in srcs[key]["sources"]:
            st, t = fetch(s["url"])
            if readable(st, t):
                text += "\n" + t
            else:
                unread.append(f"{s['url']} (HTTP {st})")
        t, sq = norm(text), squeeze(text)
        missing = [n for n in core if norm(n) not in t and not (len(squeeze(n)) >= 8 and squeeze(n) in sq)]
        if not text:
            state = "NEEDS-BROWSER"
        elif missing:
            state = "MISMATCH" if not unread else "NEEDS-BROWSER"
        else:
            state = "PASS"
        results.append({"key": key, "state": state, "found": len(core) - len(missing), "of": len(core),
                        "missing": missing, "unread": unread, "lastChecked": dates.get(key)})
    if write:
        update_dates(os.path.join(ROOT, "app", "data", "bachelorSources.ts"),
                     [r["key"] for r in results if r["state"] == "PASS"], r'(checkedOn: ")[^"]*"')
    return results


def amounts(s):
    """Money amounts in a tuition / living string: '€2,771/year, 2027-28' -> ['2771'].
    Academic-year labels (2027-28) and bare years are not amounts; decimals are kept
    ('€194.80' -> '194.80')."""
    s = re.sub(r"\b20\d\d[-–/]\d{2}\b", " ", s)
    found = re.findall(r"\d{1,3}(?:[,\s]\d{3})+(?:\.\d{1,2})?|\d{2,}(?:\.\d{1,2})?", s)
    return [re.sub(r"[,\s]", "", m) for m in found if not re.fullmatch(r"20\d\d", m)]


def check_costs(data, limit, only, write):
    unis = {u["id"]: u for u in data["universities"]}
    srcs = data["costSources"]
    dates = {k: min((e["checkedOn"] for f in ("tuition", "livingCost") for e in srcs[k].get(f, [])), key=date_key, default="")
             for k in srcs}
    results = []
    for uid in pick(list(unis), dates, limit, only):
        for field in ("tuition", "livingCost"):
            want = amounts(unis[uid][field])
            entries = srcs.get(uid, {}).get(field, [])
            if not entries:
                results.append({"key": f"{uid}.{field}", "state": "NO-SOURCE", "missing": want})
                continue
            text, unread = "", []
            for e in entries:
                st, t = fetch(e["url"])
                if readable(st, t) or (st.startswith("2") and t):
                    text += "\n" + t
                else:
                    unread.append(f"{e['url']} (HTTP {st})")
            digits = re.sub(r"(?<=\d)[.,\s'’](?=\d{3}\b)", "", text)
            missing = [a for a in want if a not in digits and a.replace(".", ",") not in digits]
            state = "PASS" if text and not missing else ("NEEDS-BROWSER" if not text or unread else "MISMATCH")
            results.append({"key": f"{uid}.{field}", "state": state, "ours": unis[uid][field], "missing": missing, "unread": unread})
    if write:
        ok = {}
        for r in results:
            uid, field = r["key"].split(".")
            ok.setdefault(uid, set()).add(field) if r["state"] == "PASS" else None
        both = [u for u, f in ok.items() if f == {"tuition", "livingCost"}]
        update_dates(os.path.join(ROOT, "app", "data", "costSources.ts"), both, r'(checkedOn: ")[^"]*"')
    return results


def main():
    args = sys.argv[1:]
    if not args or args[0] not in ("curricula", "costs"):
        print(__doc__)
        sys.exit(1)
    mode = args[0]
    limit = int(args[args.index("--limit") + 1]) if "--limit" in args else 15
    only = args[args.index("--keys") + 1].split(",") if "--keys" in args else None
    write = "--update-dates" in args
    data = load_data()
    res = (check_curricula if mode == "curricula" else check_costs)(data, limit, only, write)
    out = os.path.join(CACHE, f"report-{mode}-{datetime.date.today().isoformat()}.json")
    json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
    for r in res:
        extra = f"{r.get('found', '')}/{r.get('of', '')}" if "of" in r else ""
        print(f"{r['state']:13s} {r['key']} {extra}")
        if r["state"] != "PASS":
            for m in r.get("missing", [])[:12]:
                print(f"    missing: {m}")
            for u in r.get("unread", []):
                print(f"    unread:  {u}")
    counts = {}
    for r in res:
        counts[r["state"]] = counts.get(r["state"], 0) + 1
    print("\n" + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())) + (f"  (dates updated for PASS)" if write else ""))
    print(f"report: {out}")


if __name__ == "__main__":
    main()
