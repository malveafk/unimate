"""Replace the course list of one or more programmes in app/data/universities.ts.

  python3 scripts/uni-check/setcourses.py spec.json

spec.json: {"<university id>/<bachelor id>": [[name, credits|null, year|null, nameEn|null], ...]}
name is the official name as the university writes it; nameEn only when it is not English.
"""
import json, sys, re
import os
P=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),'app','data','universities.ts')
s=open(P).read()
spec=json.load(open(sys.argv[1]))
def line(n,c,y,e):
    n=n.replace('"','\\"'); out='          { name: "'+n+'"'
    if e: out+=', nameEn: "'+e.replace('"','\\"')+'"'
    if c: out+=', credits: "'+c+'"'
    if y: out+=f', year: {y}'
    return out+' },'
for key, courses in spec.items():
    uid,bid=key.split('/')
    ui=s.index(f'\n    id: "{uid}",')
    nxt=s.find('\n  {\n',ui); nxt=len(s) if nxt<0 else nxt
    bi=s.index(f'\n        id: "{bid}",',ui); assert bi<nxt, key
    ci=s.index('        courses: [',bi)
    if s[ci:ci+len('        courses: [],')]=='        courses: [],':
        start=ci; end=ci+len('        courses: [],')
    else:
        start=ci; end=s.index('\n        ],',ci)+len('\n        ],')
    body='        courses: [\n'+'\n'.join(line(*(c+[None]*(4-len(c)))) for c in courses)+'\n        ],'
    if not courses: body='        courses: [],'
    old_n=s[start:end].count('{ name:')
    s=s[:start]+body+s[end:]
    print(f'{key}: {old_n} -> {len(courses)}')
open(P,'w').write(s)
