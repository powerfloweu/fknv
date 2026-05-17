# Neuropszichológia képi alapú kérdések — képek

A `/neuropsy/images/` mappába kerülnek a képi alapú kérdésekhez tartozó képek.

## A jelenleg várt képek (a kérdésbankban hivatkozva)

| Fájlnév | Mit ábrázol | Kérdéshez |
|---|---|---|
| `clock-neglect.png` | Óramásolás — bal neglekt (számok csak az óra jobb oldalán) | T4 Neglekt |
| `line-bisection-neglect.png` | Vonalfelezés — a páciens jobbra tolja a felezőpontot | T4 Neglekt |
| `cube-apraxia.png` | 3D kocka másolat — konstrukciós apraxia | T6 Apraxia |
| `rey-complex.png` | Rey komplex figura másolat — dezorganizált | T6 Apraxia |
| `trail-making-B.png` | Trail Making B — set-shifting hibák | T9 Tesztek |
| `clock-AD.png` | Órarajz Alzheimer-mintával — 'stimulus-bound' | T7 Memória/demencia |
| `aphasia-broca-speech.png` | Cookie theft kép (BDAE) | T5 Afázia |
| `star-cancellation.png` | Star cancellation teszt — bal neglekt | T4 Neglekt |

## Hogyan tölts fel képet

1. Helyezd a fájlt ide: `public/neuropsy/images/<filename>.png`
2. A fájlnév pontosan egyezzen meg a fenti listával (vagy a kérdésbank `image` mezőjében szereplővel)
3. Ajánlott: PNG, max 1MB, közepes méret (~600-1200 px szélesség)
4. Forrás-jogtisztaság: csak saját készítésű vagy szabad felhasználású képet tölts fel

## Új képes kérdés hozzáadása

A `src/data/neuropsyQuestionBank.json` kérdésekben add hozzá az `image` és `imageAlt` mezőket:

```json
{
  "id": 999,
  "topicNum": 4,
  "type": "single",
  "question": "Mit látsz a képen?",
  "image": "/neuropsy/images/sajat-kep.png",
  "imageAlt": "Rövid leírás (alt text)",
  "options": ["A", "B", "C"],
  "answer": 2,
  "explanation": "..."
}
```

A UI automatikusan megjeleníti a képet a kérdés szövege fölött.
