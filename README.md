# devcat

Projekt osobistego landing page’a, rozwijany także do nauki Next.js.

## Uruchomienie

Używaj Node.js 22 (wersja startowa projektu: 22.22.3, zapisana w `.nvmrc`).
Jeśli korzystasz z nvm, uruchom najpierw `nvm use`.

```bash
npm ci
npm run dev
```

Strona będzie dostępna pod adresem http://localhost:3000.

## Polecenia

- `npm run dev` — serwer deweloperski z automatycznym odświeżaniem.
- `npm run lint` — sprawdzenie kodu przez ESLint.
- `npm run typecheck` — wygenerowanie typów tras i sprawdzenie TypeScript.
- `npm run build` — przygotowanie wersji produkcyjnej.
- `npm start` — uruchomienie wcześniej zbudowanej wersji produkcyjnej.

## Technologie

- Next.js 16.4.5 z App Routerem i Turbopackiem.
- React 19.3, TypeScript i Tailwind CSS 4.
- Cache Components i Partial Prefetching włączone w `next.config.ts`.
- npm oraz `package-lock.json` do odtwarzalnej instalacji zależności.

## Gdzie edytować

```text
src/app/
  layout.tsx    # wspólny układ, język strony i metadane
  page.tsx      # strona główna: /
  globals.css   # Tailwind i style globalne
next.config.ts  # konfiguracja Next.js
```

Alias `@/` wskazuje na katalog `src/`.

## Nauka i dalsza praca

`page.tsx` i `layout.tsx` domyślnie są Server Components. Dodawaj
`"use client"` do niewielkich komponentów wymagających np. stanu,
obsługi kliknięć albo API przeglądarki. Animacja CSS sama w sobie
nie wymaga komponentu klienckiego.

Strona startowa ma wyłącznie neutralną treść zastępczą. Projekt nie ma
biblioteki animacyjnej; wygląd, grafiki i animacje ustalimy osobno.
Używa fontu systemowego, więc build nie wymaga pobierania fontów.

Po dodaniu rzeczywistego źródła danych można przećwiczyć `Suspense`,
streaming oraz `use cache`. Nie ma potrzeby dodawać sztucznych opóźnień
do statycznej treści. Zachowanie cache i prefetchingu sprawdzaj również
przez `npm run build` oraz `npm start`, ponieważ tryb deweloperski się różni.

Dokumentacja zgodna z zainstalowaną wersją Next.js znajduje się
w `node_modules/next/dist/docs/`. Oficjalny kurs: https://nextjs.org/learn.
