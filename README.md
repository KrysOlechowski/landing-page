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
- `npm test` — testy generowania palet, konwersji kolorów i dostępu do zapisu.
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
  [section]/    # wstępne podstrony z menu; treść do uzupełnienia
src/components/
  landscape.tsx       # niezależne elementy SVG krajobrazu
  site-header.tsx     # logo i nawigacja
  palette-studio.tsx  # lokalny edytor kolorów
src/config/palette.json # paleta używana przez stronę
src/lib/palette.ts      # kolory OKLCH, odcienie, losowanie i kontrast
next.config.ts  # konfiguracja Next.js
```

Alias `@/` wskazuje na katalog `src/`.

## Nauka i dalsza praca

`page.tsx` i `layout.tsx` domyślnie są Server Components. Dodawaj
`"use client"` do niewielkich komponentów wymagających np. stanu,
obsługi kliknięć albo API przeglądarki. Animacja CSS sama w sobie
nie wymaga komponentu klienckiego.

Krajobraz to SVG renderowane bezpośrednio w React. Pagórki, drzewa,
słońce, ptaki i motyle korzystają ze wspólnych zmiennych CSS. Ruch ptaków
i skrzydeł motyli działa w CSS, bez biblioteki animacyjnej. Ustawienie
systemowe `prefers-reduced-motion` zatrzymuje animacje. Font jest systemowy,
więc build nie wymaga pobierania fontów.

## Edytor kolorów

1. Uruchom `npm run dev` i otwórz http://localhost:3000.
2. Kliknij **Paleta · lokalnie** w lewym dolnym rogu.
3. Zmień kolor próbnikiem lub wpisz HEX. Podgląd działa od razu.
   Osobne kolory mają: tekst headera (nazwa i menu), ikonka kota, ptaki,
   motyle, słońce, pagórki oraz drzewa. Dodatkowo można zmieniać tło,
   tekst podstron, rośliny i trawy oraz akcent środkowego pagórka.
4. Wypróbuj gotową paletę, **Losuj paletę** albo **Losuj odcienie pagórków**.
   Kłódki zachowują wybrane kolory podczas losowania i wyboru gotowych palet.
   Losowanie odcieni pagórków zachowuje ich ton, zmienia jasność i intensywność.
5. Suwak ustawia różnice między odcieniami. Wyłącz **Osobny akcent środkowego
   pagórka**, aby wszystkie pagórki korzystały z jednej rodziny kolorów.
   Przy włączonym akcencie środkowy pagórek używa koloru **Akcent pagórka**,
   niezależnego od drzew oraz roślin.
6. Strzałki cofają i ponawiają zmiany. **Przywróć zapisaną** przywraca ostatnią
   paletę zapisaną do projektu.
7. **Zachowaj** zapisuje nazwany wariant w tej przeglądarce. Szkic także
   jest zapamiętywany lokalnie i przywracany przy otwarciu edytora.
8. **Zapisz w projekcie** zapisuje aktywną paletę do `src/config/palette.json`.
   Commit i kolejny build/publikacja udostępnią ją wszystkim odwiedzającym.
   Ikona pobierania pozwala też wyeksportować `palette.json`.

Zapisane w przeglądarce warianty i niezapisany podgląd nie zmieniają strony
dla innych osób. Edytor nie jest renderowany ani dołączany do klienckich
plików JS wersji produkcyjnej. Endpoint zapisu zwraca tam 404. W trybie
deweloperskim zapis dopuszcza tylko żądania z tego samego lokalnego originu,
waliduje paletę i zapisuje do jednej ustalonej ścieżki.

Plik palety zawiera jedenaście kolorów bazowych, `spread` (0–1) i `accentHill`
(osobny kolor środkowego pagórka). Odwiedzający otrzymuje te same kolory
już w pierwszym HTML — nie losujemy ich podczas renderowania.
Starsze szkice i nazwane warianty z przeglądarki są automatycznie przeliczane
na nowy format: dawny kolor zwierząt trafia do ptaków i motyli, dawny kolor
tekstu do headera i kota, a kolor drzew jest początkowo zgodny z pagórkami.

Nazwy i treść podstron Work, About, Skills, Notes i Contact są na razie
punktami startowymi. Nie zawierają wymyślonych projektów ani danych kontaktowych.

Po dodaniu rzeczywistego źródła danych można przećwiczyć `Suspense`,
streaming oraz `use cache`. Nie ma potrzeby dodawać sztucznych opóźnień
do statycznej treści. Zachowanie cache i prefetchingu sprawdzaj również
przez `npm run build` oraz `npm start`, ponieważ tryb deweloperski się różni.

Dokumentacja zgodna z zainstalowaną wersją Next.js znajduje się
w `node_modules/next/dist/docs/`. Oficjalny kurs: https://nextjs.org/learn.
