import json

with open('src/data/questionBank.json', encoding='utf-8') as f:
    data = json.load(f)

out = []
for q in data:
    qid = q.get('id', None)
    kerdes = q.get('kérdés', None)
    if 'helyes_válaszok' in q:
        helyes = [q['válaszlehetőségek'][i-1] for i in q['helyes_válaszok'] if 0 < i <= len(q['válaszlehetőségek'])]
        out.append({'id': qid, 'kerdes': kerdes, 'helyes_valasz': helyes})
    elif 'helyes_válasz' in q:
        idx = q['helyes_válasz']-1
        helyes = q['válaszlehetőségek'][idx] if 0 <= idx < len(q['válaszlehetőségek']) else None
        out.append({'id': qid, 'kerdes': kerdes, 'helyes_valasz': helyes})
    else:
        out.append({'id': qid, 'kerdes': kerdes, 'helyes_valasz': None})

with open('src/data/helyes_valaszok.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print('Kész: src/data/helyes_valaszok.json')
