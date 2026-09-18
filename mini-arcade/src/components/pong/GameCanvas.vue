<template>
  <div class="screen" :class="{ 'screen--side': sideBar }">

    <div class="canvas-wrapper" :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }">
      <canvas
        ref="canvasRef"
        :width="CW"
        :height="CH"
        :style="{ width: displayWidth + 'px', height: displayHeight + 'px' }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
      />


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
          <div class="panel" :class="isVersusAi && winnerText === 'PLAYER 1' ? 'panel--win' : 'panel--lose'">
            <div class="panel-icon">{{ isVersusAi && winnerText === 'PLAYER 1' ? '🏆' : '💀' }}</div>
            <h1>{{ isVersusAi && winnerText === 'PLAYER 1' ? 'YOU WIN!' : 'GAME OVER' }}</h1>
            <p class="final-score-label">WINNER</p>
            <p class="final-score">{{ winnerText }}</p>
            <p class="final-score-label">FINAL SCORE</p>
            <p class="final-score">{{ playerScore }} - {{ aiScore }}</p>
            <ScoreSubmit v-if="isVersusAi" game="pong" :score="rankPoints" show-score />
            <div class="btn-group">
              <button class="btn" @click="startGame">PLAY AGAIN</button>
              <button class="btn" @click="$emit('menu')">MAIN MENU</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <TouchBar v-if="touch" :side="sideBar">
      <TouchButton accent wide label="Pause" @press="togglePause">❚❚ PAUSE</TouchButton>
      <span v-if="!sideBar && displayWidth < 520" class="touch-hint">DRAG TO MOVE · TIP: ROTATE YOUR PHONE</span>
      <span v-else class="touch-hint">DRAG {{ isVersusAi ? 'ANYWHERE' : 'YOUR SIDE' }} TO MOVE</span>
    </TouchBar>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import './GameCanvas.css'
import TouchBar from '../shared/TouchBar.vue'
import TouchButton from '../shared/TouchButton.vue'
import ScoreSubmit from '../shared/ScoreSubmit.vue'
import { useViewport } from '../../composables/useViewport.js'

const { touch, sideBar, avail, fit } = useViewport()

const props = defineProps({
  mode: {
    type: String,
    default: 'single',
  },
})

const isVersusAi = computed(() => props.mode !== 'pvp')

const HUD_H = 52
const BASE_W = 960
const BASE_H = 540
const WIN_SCORE = 7
const MAX_BOUNCE_ANGLE = Math.PI / 3

// The game always runs at BASE_W x BASE_H; the canvas is scaled with CSS to fit the screen.
const CW = BASE_W
const CH = BASE_H
const playH = CH - HUD_H

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const displayWidth = ref(BASE_W)
const displayHeight = ref(BASE_H)
let hudScale = 1

function computeSize() {
  // desktop keeps a margin around the field, touch screens use all the free space
  const scale = touch.value ? fit(BASE_W, BASE_H) : Math.min(fit(BASE_W, BASE_H) * 0.94, 1.6)
  displayWidth.value = Math.max(1, Math.floor(BASE_W * scale))
  displayHeight.value = Math.max(1, Math.floor(BASE_H * scale))
  // keep the HUD text readable when the field is scaled down a lot
  hudScale = clamp(0.62 / scale, 1, 2.2)
}

defineEmits(['menu'])

const canvasRef = ref(null)
const gameState = ref('running')
const playerScore = ref(0)
const aiScore = ref(0)
const winnerText = ref('')
const rightLabel = computed(() => (isVersusAi.value ? 'CPU' : 'P2'))

// Leaderboard points for a match against the CPU:
// a win is worth 1000 plus 100 per point of margin, a loss 100 per point scored.
const rankPoints = computed(() => {
  if (playerScore.value >= WIN_SCORE) return 1000 + (WIN_SCORE - aiScore.value) * 100
  return playerScore.value * 100
})

const paddle = {
  width: 14,
  height: 96,
  speed: 560,
  x: 18,
  y: 0,
}

const ai = {
  width: 14,
  height: 96,
  speed: 480,
  x: 0,
  y: 0,
}

const ball = {
  size: 14,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  baseSpeed: 550,
  maxSpeed: 860,
}

const keys = {
  leftUp: false,
  leftDown: false,
  rightUp: false,
  rightDown: false,
}

let frameId = null
let lastTime = 0

function resetObjects() {
  paddle.height = clamp(Math.floor(playH * 0.21), 72, 120)
  ai.height = paddle.height
  paddle.width = clamp(Math.floor(CW * 0.015), 12, 18)
  ai.width = paddle.width

  paddle.x = 18
  ai.x = CW - ai.width - 18
  paddle.y = HUD_H + playH / 2 - paddle.height / 2
  ai.y = HUD_H + playH / 2 - ai.height / 2

  ball.size = clamp(Math.floor(CW * 0.014), 10, 16)
  resetBall(Math.random() > 0.5 ? 1 : -1)
}

function resetBall(direction) {
  ball.x = CW / 2 - ball.size / 2
  ball.y = HUD_H + playH / 2 - ball.size / 2

  const angle = (Math.random() * 0.8 - 0.4) * MAX_BOUNCE_ANGLE
  const speed = ball.baseSpeed
  ball.vx = Math.cos(angle) * speed * direction
  ball.vy = Math.sin(angle) * speed
}

function startGame() {
  playerScore.value = 0
  aiScore.value = 0
  winnerText.value = ''
  keys.leftUp = false
  keys.leftDown = false
  keys.rightUp = false
  keys.rightDown = false
  gameState.value = 'running'
  resetObjects()
}

function pause() {
  if (gameState.value === 'running') gameState.value = 'paused'
}

function resume() {
  if (gameState.value === 'paused') gameState.value = 'running'
}

function togglePause() {
  if (gameState.value === 'running') pause()
  else if (gameState.value === 'paused') resume()
}

function onKeyDown(e) {
  if (e.key === 'w' || e.key === 'W') {
    e.preventDefault()
    keys.leftUp = true
  }
  if (e.key === 's' || e.key === 'S') {
    e.preventDefault()
    keys.leftDown = true
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (isVersusAi.value) keys.leftUp = true
    else keys.rightUp = true
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (isVersusAi.value) keys.leftDown = true
    else keys.rightDown = true
  }
  if (e.key === ' ' || e.key === 'Escape') {
    e.preventDefault()
    togglePause()
  }
}

// touch / mouse drag: the paddle follows the finger.
// Against the CPU any touch moves your paddle; in 2-player mode each half of the field owns a paddle.
const pointers = new Map()

function pointerTarget(x) {
  return !isVersusAi.value && x > CW / 2 ? ai : paddle
}

function moveWithPointer(e, target) {
  const rect = canvasRef.value.getBoundingClientRect()
  const y = (e.clientY - rect.top) * (CH / rect.height)
  target.y = clamp(y - target.height / 2, HUD_H, CH - target.height)
}

function onPointerDown(e) {
  if (gameState.value !== 'running') return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) * (CW / rect.width)
  const target = pointerTarget(x)
  pointers.set(e.pointerId, target)
  canvasRef.value.setPointerCapture?.(e.pointerId)
  moveWithPointer(e, target)
}

function onPointerMove(e) {
  const target = pointers.get(e.pointerId)
  if (!target || gameState.value !== 'running') return
  moveWithPointer(e, target)
}

function onPointerEnd(e) {
  pointers.delete(e.pointerId)
  canvasRef.value?.releasePointerCapture?.(e.pointerId)
}

function onKeyUp(e) {
  if (e.key === 'w' || e.key === 'W') keys.leftUp = false
  if (e.key === 's' || e.key === 'S') keys.leftDown = false
  if (e.key === 'ArrowUp') {
    if (isVersusAi.value) keys.leftUp = false
    else keys.rightUp = false
  }
  if (e.key === 'ArrowDown') {
    if (isVersusAi.value) keys.leftDown = false
    else keys.rightDown = false
  }
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function scorePoint(side) {
  if (side === 'player') {
    playerScore.value += 1
    if (playerScore.value >= WIN_SCORE) {
      winnerText.value = 'PLAYER 1'
      gameState.value = 'gameover'
      return
    }
    resetBall(-1)
    return
  }

  aiScore.value += 1
  if (aiScore.value >= WIN_SCORE) {
    winnerText.value = isVersusAi.value ? 'CPU' : 'PLAYER 2'
    gameState.value = 'gameover'
    return
  }
  resetBall(1)
}

function update(dt) {
  if (gameState.value !== 'running') return

  const paddleDelta = paddle.speed * dt
  if (keys.leftUp) paddle.y -= paddleDelta
  if (keys.leftDown) paddle.y += paddleDelta
  paddle.y = clamp(paddle.y, HUD_H, CH - paddle.height)

  if (isVersusAi.value) {
    const aiCenter = ai.y + ai.height / 2
    const target = ball.y + ball.size / 2
    const follow = clamp(target - aiCenter, -ai.speed * dt, ai.speed * dt)
    ai.y = clamp(ai.y + follow, HUD_H, CH - ai.height)
  } else {
    const rightDelta = ai.speed * dt
    if (keys.rightUp) ai.y -= rightDelta
    if (keys.rightDown) ai.y += rightDelta
    ai.y = clamp(ai.y, HUD_H, CH - ai.height)
  }

  ball.x += ball.vx * dt
  ball.y += ball.vy * dt

  if (ball.y <= HUD_H) {
    ball.y = HUD_H
    ball.vy = Math.abs(ball.vy)
  }
  if (ball.y + ball.size >= CH) {
    ball.y = CH - ball.size
    ball.vy = -Math.abs(ball.vy)
  }

  const ballRect = { x: ball.x, y: ball.y, w: ball.size, h: ball.size }
  const playerRect = { x: paddle.x, y: paddle.y, w: paddle.width, h: paddle.height }
  const aiRect = { x: ai.x, y: ai.y, w: ai.width, h: ai.height }

  if (ball.vx < 0 && intersects(ballRect, playerRect)) {
    ball.x = paddle.x + paddle.width
    const relative = ((ball.y + ball.size / 2) - (paddle.y + paddle.height / 2)) / (paddle.height / 2)
    const angle = clamp(relative, -1, 1) * MAX_BOUNCE_ANGLE
    const speed = clamp(Math.hypot(ball.vx, ball.vy) + 28, ball.baseSpeed, ball.maxSpeed)
    ball.vx = Math.cos(angle) * speed
    ball.vy = Math.sin(angle) * speed
  }

  if (ball.vx > 0 && intersects(ballRect, aiRect)) {
    ball.x = ai.x - ball.size
    const relative = ((ball.y + ball.size / 2) - (ai.y + ai.height / 2)) / (ai.height / 2)
    const angle = clamp(relative, -1, 1) * MAX_BOUNCE_ANGLE
    const speed = clamp(Math.hypot(ball.vx, ball.vy) + 22, ball.baseSpeed, ball.maxSpeed)
    ball.vx = -Math.cos(angle) * speed
    ball.vy = Math.sin(angle) * speed
  }

  if (ball.x + ball.size < 0) scorePoint('ai')
  if (ball.x > CW) scorePoint('player')
}

function drawHUD(ctx) {
  ctx.save()
  ctx.fillStyle = 'rgba(2, 20, 48, 0.62)'
  ctx.fillRect(0, 0, CW, HUD_H)

  const fontPx = Math.round(12 * hudScale)
  const baseline = HUD_H / 2 + fontPx * 0.58
  ctx.textAlign = 'left'
  ctx.font = `${fontPx}px 'Press Start 2P'`
  ctx.fillStyle = 'rgba(0, 240, 255, 0.58)'
  ctx.fillText('PLAYER', 16, baseline)

  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255, 150, 220, 0.58)'
  ctx.fillText(rightLabel.value, CW - 16, baseline)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#00f0ff'
  ctx.fillText(`${playerScore.value}  :  ${aiScore.value}`, CW / 2, baseline)
  ctx.restore()
}

function drawCenterLine(ctx) {
  ctx.save()
  ctx.strokeStyle = 'rgba(0, 180, 255, 0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(CW / 2, HUD_H + 10)
  ctx.lineTo(CW / 2, CH - 10)
  ctx.stroke()
  ctx.restore()
}

function drawPaddle(ctx, target, glowColor) {
  ctx.save()
  ctx.shadowColor = glowColor
  ctx.shadowBlur = 16
  ctx.fillStyle = glowColor
  ctx.fillRect(target.x, target.y, target.width, target.height)
  ctx.restore()
}

function drawBall(ctx) {
  ctx.save()
  ctx.shadowColor = '#ffe600'
  ctx.shadowBlur = 14
  ctx.fillStyle = '#ffe600'
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size)
  ctx.restore()
}

function renderFrame() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#021430'
  ctx.fillRect(0, 0, CW, CH)

  drawHUD(ctx)

  ctx.save()
  ctx.strokeStyle = 'rgba(0, 120, 255, 0.16)'
  ctx.lineWidth = 1
  for (let y = HUD_H; y <= CH; y += 28) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CW, y)
    ctx.stroke()
  }
  ctx.restore()

  drawCenterLine(ctx)
  drawPaddle(ctx, paddle, '#00f0ff')
  drawPaddle(ctx, ai, '#ff6ad5')
  drawBall(ctx)
}

function loop(time) {
  if (!lastTime) lastTime = time
  const dt = Math.min((time - lastTime) / 1000, 0.033)
  lastTime = time

  update(dt)
  renderFrame()
  frameId = requestAnimationFrame(loop)
}

watch([avail, touch], computeSize)
computeSize()

onMounted(() => {
  startGame()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  cancelAnimationFrame(frameId)
})
</script>

<style scoped>
/* all styles in GameCanvas.css */
.touch-hint {
  flex: 2 1 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  line-height: 1.7;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}
</style>