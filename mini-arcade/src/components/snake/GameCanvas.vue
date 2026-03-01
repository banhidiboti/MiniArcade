<template>
  <div class="screen">

    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="CW" :height="CH" />


      <!-- Pause overlay -->
      <Transition name="fade">
        <div v-if="gameState === 'paused'" class="overlay">
          <div class="panel panel--pause">
            <div class="panel-icon--pause">⏸</div>
            <h1>PAUSED</h1>
            <p class="pause-hint">Press SPACE or ESC to continue</p>
            <div class="btn-group">
              <button class="btn" @click="resume">RESUME</button>
              <button class="btn" @click="startGame">NEW GAME</button>
              <button class="btn" @click="$emit('menu')">MAIN MENU</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Game Over overlay -->
      <Transition name="fade">
        <div v-if="gameState === 'gameover'" class="overlay">
          <div class="panel panel--lose">
            <div class="panel-icon">💀</div>
            <h1>GAME OVER</h1>
            <p class="final-score-label">SCORE</p>
            <p class="final-score">{{ pad(score) }}</p>
            <div class="btn-group">
              <button class="btn" @click="startGame">PLAY AGAIN</button>
              <button class="btn" @click="$emit('menu')">MAIN MENU</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import './GameCanvas.css'

// ── Grid config ────────────────────────────────────────────────────────────
const HUD_H     = 52
const COLS      = 25
const ROWS      = 25
const MIN_CELL  = 12

const BASE_MS   = 150
const MIN_MS    = 60
const STEP_MS   = 15
const FOODS_LVL = 5

const FOOD_TYPES = [
  { score: 5,  color: '#39ff14', glow: '#39ff14' },
  { score: 10, color: '#ffe600', glow: '#ffe600' },
  { score: 20, color: '#ff006e', glow: '#ff006e' },
]
const FOOD_WEIGHTS = [0.65, 0.23, 0.12]

let CELL = 20
let CW = CELL * COLS
let CH = HUD_H + CELL * ROWS

function computeSize() {
  const nextCell = Math.max(
    MIN_CELL,
    Math.floor(Math.min(window.innerWidth / COLS, (window.innerHeight - HUD_H) / ROWS))
  )

  CELL = nextCell
  CW = CELL * COLS
  CH = HUD_H + CELL * ROWS

  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = CW
    canvas.height = CH
  }
}

defineEmits(['menu'])

// ── Reactive ───────────────────────────────────────────────────────────────
const canvasRef = ref(null)
const gameState = ref('running')
const score     = ref(0)
const highScore = ref(0)  // no persistence

// ── Game vars ──────────────────────────────────────────────────────────────
let snake      = [{ x: 12, y: 12 }]
let dir        = { x: 1, y: 0 }
let nextDir    = { x: 1, y: 0 }
let food       = null
let particles  = []
let eatCount   = 0
let level      = 1
let intervalMs = BASE_MS
let loopTimer  = null
let frameId    = null

// ── Helpers ────────────────────────────────────────────────────────────────
function pad(n) { return String(n) }

function pickFood() {
  const r = Math.random()
  let acc = 0
  for (let i = 0; i < FOOD_WEIGHTS.length; i++) {
    acc += FOOD_WEIGHTS[i]
    if (r < acc) return FOOD_TYPES[i]
  }
  return FOOD_TYPES[0]
}

function spawnFood() {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`))
  let pos
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (occupied.has(`${pos.x},${pos.y}`))
  food = { ...pos, ...pickFood(), pulse: 0 }
}

function spawnParticles(gx, gy, color) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12
    const speed = 1.5 + Math.random() * 2.5
    particles.push({
      x: gx * CELL + CELL / 2,
      y: HUD_H + gy * CELL + CELL / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1, color,
      size: 2 + Math.random() * 2.5,
    })
  }
}

// ── Game logic ─────────────────────────────────────────────────────────────
function tick() {
  if (gameState.value !== 'running') return
  dir = { ...nextDir }
  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  }
  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { endGame(); return }
  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) { endGame(); return }
  snake = [head, ...snake]
  if (food && head.x === food.x && head.y === food.y) {
    score.value += food.score
    spawnParticles(food.x, food.y, food.glow)
    eatCount++
    spawnFood()
    const newLevel = Math.floor(eatCount / FOODS_LVL) + 1
    if (newLevel > level) {
      level = newLevel
      intervalMs = Math.max(MIN_MS, BASE_MS - (level - 1) * STEP_MS)
      restartLoop()
    }
  } else {
    snake = snake.slice(0, -1)
  }
}

function restartLoop() {
  clearInterval(loopTimer)
  loopTimer = setInterval(tick, intervalMs)
}

function endGame() {
  gameState.value = 'gameover'
  clearInterval(loopTimer)
  if (score.value > highScore.value) {
    highScore.value = score.value
  }
}

// ── Controls ───────────────────────────────────────────────────────────────
function startGame() {
  snake        = [{ x: 12, y: 12 }]
  dir          = { x: 1, y: 0 }
  nextDir      = { x: 1, y: 0 }
  score.value  = 0
  eatCount     = 0
  level        = 1
  intervalMs   = BASE_MS
  particles    = []
  spawnFood()
  gameState.value = 'running'
  restartLoop()
}

function pause()       { if (gameState.value === 'running') { gameState.value = 'paused';  clearInterval(loopTimer) } }
function resume()      { if (gameState.value === 'paused')  { gameState.value = 'running'; restartLoop() } }
function togglePause() { gameState.value === 'running' ? pause() : resume() }

const KEY_MAP = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 }, S: { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 }, d: { x:  1, y: 0 }, D: { x:  1, y: 0 },
}

function onKey(e) {
  if (KEY_MAP[e.key]) {
    e.preventDefault()
    const nd = KEY_MAP[e.key]
    if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd
  }
  if (e.key === ' ' || e.key === 'Escape') { e.preventDefault(); togglePause() }
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  frameId = requestAnimationFrame(render)
  const canvas = canvasRef.value
  if (!canvas) return
  if (!CELL) return
  const ctx = canvas.getContext('2d')

  // Update particles & food
  particles = particles.filter(p => p.life > 0).map(p => ({
    ...p,
    x: p.x + p.vx, y: p.y + p.vy,
    vx: p.vx * 0.91, vy: p.vy * 0.91,
    life: p.life - 0.038,
  }))
  if (food) food.pulse = (food.pulse + 0.08) % (Math.PI * 2)

  // ── Background ──
  ctx.save()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur  = 0
  ctx.fillStyle = '#021430'
  ctx.fillRect(0, 0, CW, CH)
  ctx.fillStyle = 'rgba(2, 20, 48, 0.55)'
  ctx.fillRect(0, 0, CW, HUD_H)
  ctx.restore()

  // ── HUD strip (top, inside canvas) ──
  drawHUD(ctx)

  // ── Separator line ──
  ctx.save()
  ctx.shadowBlur  = 0
  ctx.strokeStyle = 'rgba(0, 150, 255, 0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, HUD_H)
  ctx.lineTo(CW, HUD_H)
  ctx.stroke()
  ctx.restore()

  // ── Grid lines — always aligned to game cells ──
  ctx.save()
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(0, 120, 255, 0.12)'
  ctx.lineWidth = 1

  for (let gx = 0; gx <= COLS; gx++) {
    const x = gx * CELL
    ctx.beginPath()
    ctx.moveTo(x, HUD_H)
    ctx.lineTo(x, CH)
    ctx.stroke()
  }

  for (let gy = 0; gy <= ROWS; gy++) {
    const y = HUD_H + gy * CELL
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CW, y)
    ctx.stroke()
  }
  ctx.restore()

  drawFood(ctx)
  // reset shadow after food glow
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'
  drawSnake(ctx)
  // reset shadow after snake glow
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'
  drawParticles(ctx)
  ctx.shadowBlur  = 0
  ctx.shadowColor = 'transparent'
}

function drawHUD(ctx) {
  ctx.save()

  const midY = HUD_H / 2 + 7

  // SCORE: XX — left
  ctx.textAlign = 'left'
  ctx.font = "12px 'Press Start 2P'"
  ctx.fillStyle = 'rgba(0, 240, 255, 0.55)'
  ctx.fillText('SCORE: ', 16, midY)
  const scoreLabelW = ctx.measureText('SCORE: ').width
  ctx.fillStyle = '#00f0ff'
  ctx.fillText(score.value, 16 + scoreLabelW, midY)

  // LEVEL: X — right
  ctx.textAlign = 'right'
  ctx.font = "12px 'Press Start 2P'"
  const levelValW = ctx.measureText(level).width
  ctx.fillStyle = 'rgba(0, 240, 255, 0.55)'
  ctx.fillText('LEVEL: ', CW - 16 - levelValW, midY)
  ctx.fillStyle = '#00f0ff'
  ctx.fillText(level, CW - 16, midY)

  ctx.restore()
}

function drawFood(ctx) {
  if (!food) return
  const cx = food.x * CELL + CELL / 2
  const cy = HUD_H + food.y * CELL + CELL / 2

  ctx.save()
  ctx.shadowColor = food.glow
  ctx.shadowBlur  = 18
  ctx.fillStyle   = food.color
  ctx.beginPath()
  ctx.arc(cx, cy, CELL * 0.25, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, CELL * 0.38, 0, Math.PI * 2)
  ctx.strokeStyle = food.color
  ctx.globalAlpha = 0.3
  ctx.lineWidth   = 1.5
  ctx.stroke()
  ctx.restore()
}

function drawSnake(ctx) {
  snake.forEach((seg, i) => {
    const isHead = i === 0
    const t      = 1 - i / snake.length
    const alpha  = 0.2 + t * 0.8
    const pad2   = 2
    const x      = seg.x * CELL + pad2
    const y      = HUD_H + seg.y * CELL + pad2
    const size   = CELL - pad2 * 2

    ctx.save()
    if (isHead) {
      ctx.shadowColor = '#00f0ff'
      ctx.shadowBlur  = 18
      ctx.fillStyle   = '#00f0ff'
    } else {
      const r = Math.round(68  * (1 - t))
      const g = Math.round(240 * t + 170 * (1 - t))
      ctx.fillStyle   = `rgba(${r},${g},255,${alpha})`
      ctx.shadowColor = `rgba(${r},${g},255,0.5)`
      ctx.shadowBlur  = 6
    }

    ctx.beginPath()
    ctx.roundRect(x, y, size, size, isHead ? 6 : 4)
    ctx.fill()

    if (isHead) drawEyes(ctx, x, y, size)
    ctx.restore()
  })
}

function drawEyes(ctx, x, y, size) {
  ctx.fillStyle  = 'rgba(0, 20, 60, 0.9)'
  ctx.shadowBlur = 0
  const off = size * 0.22
  const mid = size / 2
  let pairs

  if      (dir.x === 1)  pairs = [[x+size-off, y+mid-off], [x+size-off, y+mid+off]]
  else if (dir.x === -1) pairs = [[x+off,       y+mid-off], [x+off,      y+mid+off]]
  else if (dir.y === -1) pairs = [[x+mid-off,   y+off    ], [x+mid+off,  y+off    ]]
  else                   pairs = [[x+mid-off,   y+size-off],[x+mid+off,  y+size-off]]

  pairs.forEach(([ex, ey]) => {
    ctx.beginPath(); ctx.arc(ex, ey, size * 0.1, 0, Math.PI * 2); ctx.fill()
  })
}

function drawParticles(ctx) {
  particles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.life
    ctx.fillStyle   = p.color
    ctx.shadowColor = p.color
    ctx.shadowBlur  = 10
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
const onResize = () => computeSize()

onMounted(() => {
  computeSize()
  startGame()
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  frameId = requestAnimationFrame(render)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(frameId)
  clearInterval(loopTimer)
})
</script>

<style scoped>
/* all styles in GameCanvas.css */
</style>