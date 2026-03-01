# Mini Arcade

Neon stílusú, többjátékos mini-arcade gyűjtemény Vue 3 + Vite alapon.

## Tartalom

- Brick Breaker (Classic + Endless)
- Cyber Snake
- Neon Pong (1P + 1v1)
- Cosmic Invaders (Classic + Endless)
- Neon Blocks (pentomino alapú, 15×23 pálya)

## Tech stack

- Vue 3 (Composition API)
- Vite
- Canvas alapú renderelés (játéklogika és animáció)
- Sima CSS (komponensenkénti stílusok)

## Játékok és irányítás

### 1) Brick Breaker

**Módok**
- Classic: az összes téglát ki kell ütni.
- Endless: a kiürült sorok visszatöltődnek, a játék életekig tart.

**Irányítás**
- `A` / `←`: balra
- `D` / `→`: jobbra
- `SPACE` / `ESC`: pause / resume

**Megjegyzés**
- A fehér keretes téglák extra labdát spawnolhatnak.

### 2) Cyber Snake

**Irányítás**
- `W` / `↑`: fel
- `A` / `←`: bal
- `S` / `↓`: le
- `D` / `→`: jobb
- `SPACE` / `ESC`: pause / resume

**Szabályok**
- Kajaevéssel nő a kígyó.
- Minden 5. kaja után gyorsul.
- Kajapontok: 5 / 10 / 20.

### 3) Neon Pong

**Módok**
- 1 Player (AI ellen)
- 1v1 (két játékos)

**Irányítás**
- `W` / `↑`: fel
- `S` / `↓`: le
- `SPACE` / `ESC`: pause / resume

**Szabály**
- 7 pontig tart a meccs.

### 4) Cosmic Invaders

**Módok**
- Classic
- Endless

**Irányítás**
- `A/D` vagy `←/→`: mozgás
- `W/↑`: lövés
- `SPACE` / `ESC`: pause / resume

**Pontozás**
- Zöld alien: 5 pont
- Lila alien: 10 pont

### 5) Neon Blocks

**Irányítás**
- `A/D` vagy `←/→`: mozgatás
- `W/↑`: forgatás
- `S/↓`: soft drop
- `SPACE` / `ESC`: pause / resume

**Szabályok**
- 15×23-as rács.
- Pentomino (5 cellás) elemek.
- Teli sor törlés, kombó pontozás.
- Minden 5 törölt sor után szintlépés és gyorsulás.

## Projektstruktúra

```text
mini-arcade/
├── public/
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── style.css
│   └── components/
│       ├── ArcadeMenu.vue
│       ├── ArcadeMenu.css
│       ├── brickbreaker/
│       │   ├── WelcomeScreen.vue
│       │   ├── GameCanvas.vue
│       │   └── GameCanvasEndless.vue
│       ├── snake/
│       │   ├── WelcomeScreen.vue
│       │   └── GameCanvas.vue
│       ├── pong/
│       │   ├── WelcomeScreen.vue
│       │   └── GameCanvas.vue
│       ├── invaders/
│       │   ├── WelcomeScreen.vue
│       │   └── GameCanvas.vue
│       └── blocks/
│           ├── Welcomescreen.vue
│           └── GameCanvas.vue
├── index.html
├── vite.config.js
└── package.json
```

## Telepítés és futtatás

### 1) Függőségek telepítése

```bash
npm install
```

### 2) Fejlesztői futtatás

Jelenleg nincs külön `dev` script, ezért Vite közvetlenül:

```bash
npx vite
```

### 3) Build

```bash
npm run build
```

### 4) Deploy (GitHub Pages)

```bash
npm run deploy
```


- A projekt több helyen canvas + key event kombinációt használ, ezért böngészőfókusz esetén az input viselkedése eltérhet.
- A `blocks` welcome komponens fájlneve jelenleg `Welcomescreen.vue`; case-sensitive rendszeren érdemes a hivatkozásoknál erre figyelni.

