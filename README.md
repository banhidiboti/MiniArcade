# Mini Arcade

A retro-style arcade built with Vue 3 and Vite. This project includes multiple neon-themed mini-games with a shared arcade menu.

## Games Included

### 1) Brick Breaker
- Modes:
	- **Classic**: clear all bricks to win.
	- **Endless**: cleared rows respawn, and the game continues until you lose all lives.
- Controls:
	- `A` / `←` = move paddle left
	- `D` / `→` = move paddle right
	- `Space` or `Esc` = pause / resume
- Extra mechanics:
	- White-outlined bonus bricks can spawn extra balls.
	- You start with 3 lives.

### 2) Cyber Snake
- Objective: eat food, grow your snake, and avoid collisions.
- Controls:
	- `W` / `↑` = up
	- `A` / `←` = left
	- `S` / `↓` = down
	- `D` / `→` = right
	- `Space` or `Esc` = pause / resume
- Extra mechanics:
	- Speed increases every 5 foods.
	- Food has different score values (5, 10, 20 points).

## Tech Stack
- Vue 3 (Composition API)
- Vite
- Plain CSS (component-scoped and global styles)

## Project Structure

```
mini-arcade/
├── public/
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── style.css
│   ├── assets/
│   └── components/
│       ├── ArcadeMenu.vue
│       ├── ArcadeMenu.css
│       ├── brickbreaker/
│       │   ├── WelcomeScreen.vue
│       │   ├── GameCanvas.vue
│       │   ├── GameCanvasEndless.vue
│       │   └── *.css
│       └── snake/
│           ├── WelcomeScreen.vue
│           ├── GameCanvas.vue
│           └── *.css
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Run in development
This project currently has no `dev` script in `package.json`, so run Vite directly:

```bash
npx vite
```

### 3) Build for production
```bash
npm run build
```

### 4) Deploy (GitHub Pages)
```bash
npm run deploy
```

## Notes
- Main game routing is handled in `src/App.vue`.
- The arcade menu is in `src/components/ArcadeMenu.vue`.
- Brick Breaker and Snake game logic are in their respective `GameCanvas.vue` files.
