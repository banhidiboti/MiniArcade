# Mini Arcade

Neon-style multi-game mini arcade collection built with **Vue 3** + **Vite**.

Play classic arcade games with a modern neon aesthetic — all in your browser!

## Games Included

- **Brick Breaker** (Classic + Endless)
- **Cyber Snake**
- **Neon Pong** (1 Player vs AI + 1v1 local)
- **Cosmic Invaders** (Classic + Endless)
- **Neon Blocks** (pentomino-based puzzle, 15×23 grid)

## Controls & Rules

### 1. Brick Breaker

**Modes**  
- Classic — clear all bricks  
- Endless — rows refill, survive as long as possible  

**Controls**  
- `A` / `←` — move left  
- `D` / `→` — move right  
- `SPACE` / `ESC` — pause / resume  

**Note**: White-bordered bricks may spawn an extra ball.

### 2. Cyber Snake

**Controls**  
- `W`/`↑` • `A`/`←` • `S`/`↓` • `D`/`→` — movement  
- `SPACE` / `ESC` — pause / resume  

**Rules**  
- Eat food to grow  
- Every 5th food → speed increases  
- Points: 5 / 10 / 20 depending on food type

### 3. Neon Pong

**Modes**  
- 1 Player (vs AI)  
- 1v1 (local two players)  

**Controls**  
- Player 1: `W` / `↑` — up • `S` / `↓` — down  
- Player 2 (1v1): same keys (right paddle)  
- `SPACE` / `ESC` — pause / resume  

**Rule**: First to **7 points** wins.

### 4. Cosmic Invaders

**Modes**  
- Classic  
- Endless  

**Controls**  
- `A`/`←` • `D`/`→` — move  
- `W` / `↑` — shoot  
- `SPACE` / `ESC` — pause / resume  

**Scoring**  
- Green alien → 5 points  
- Purple alien → 10 points

### 5. Neon Blocks

**Controls**  
- `A`/`←` • `D`/`→` — move piece  
- `W` / `↑` — rotate  
- `S` / `↓` — soft drop  
- `SPACE` / `ESC` — pause / resume  

**Rules**  
- 15 × 23 grid  
- Pentomino pieces (5 cells each)  
- Clear full rows → points + combos  
- Every 5 rows cleared → level up & faster speed

## Tech Stack

- **Vue 3** (Composition API)  
- **Vite**  
- HTML5 **Canvas** (rendering + game logic)  
- Plain CSS (component-scoped styles)

## Project Structure

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



## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npx vite
# or if you add to package.json scripts:
# npm run dev


- A projekt több helyen canvas + key event kombinációt használ, ezért böngészőfókusz esetén az input viselkedése eltérhet.
- A `blocks` welcome komponens fájlneve jelenleg `Welcomescreen.vue`; case-sensitive rendszeren érdemes a hivatkozásoknál erre figyelni.


