import sys, re, html
s = open(sys.argv[1], encoding="utf-8", errors="replace").read()
s = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", s)
s = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|td|th|h[1-6]|section|article|dt|dd|option|span|a)>", "\n", s)
s = re.sub(r"<[^>]+>", " ", s)
s = html.unescape(s)
for line in s.split("\n"):
    line = re.sub(r"\s+", " ", line).strip()
    if line: print(line)
