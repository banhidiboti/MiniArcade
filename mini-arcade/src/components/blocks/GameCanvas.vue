<template>
  <div class="screen">
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="WIDTH" :height="HEIGHT"></canvas>

      <div v-if="gameState === 'paused'" class="overlay">
        <div class="panel panel--pause">
          <h1>PAUSED</h1>
          <p class="panel-sub">Press SPACE or ESC to continue</p>
          <div class="btn-group">
            <button class="btn" @click="resumeGame">RESUME</button>
            <button class="btn" @click="startGame">NEW GAME</button>
            <button class="btn" @click="$emit('menu')">MAIN MENU</button>
          </div>
        </div>
      </div>

      <div v-if="gameState === 'gameover'" class="overlay">
        <div class="panel panel--lose">
          <h1>GRID LOCK</h1>
          <p class="panel-score">{{ score }}</p>
          <div class="btn-group">
            <button class="btn" @click="startGame">PLAY AGAIN</button>
            <button class="btn" @click="$emit('menu')">MAIN MENU</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import './GameCanvas.css'

defineEmits(['menu'])

const COLS = 15
const ROWS = 23
const CELL = 32
const HUD_HEIGHT = 104
const BOARD_WIDTH = COLS * CELL
const BOARD_HEIGHT = ROWS * CELL
const WIDTH = BOARD_WIDTH
const HEIGHT = HUD_HEIGHT + BOARD_HEIGHT

const COLORS = ['#ff4466', '#ff7733', '#44ff88', '#44ccff', '#bb66ff']
const SOFT_DROP_SPEED_MULTIPLIER = 4

const PIECES = [
  {
    id: 'F',
    blocks: [
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'I',
    blocks: [
      { x: -2, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  },
  {
    id: 'L',
    blocks: [
      { x: 0, y: -2 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'P',
    blocks: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: -1 },
    ],
  },
  {
    id: 'N',
    blocks: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'T',
    blocks: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ],
  },
  {
    id: 'U',
    blocks: [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
    ],
  },
  {
    id: 'V',
    blocks: [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'W',
    blocks: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'X',
    blocks: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ],
  },
  {
    id: 'Y',
    blocks: [
      { x: 0, y: -2 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ],
  },
  {
    id: 'Z',
    blocks: [
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
]

const canvasRef = ref(null)
const gameState = ref('running')
const score = ref(0)
const lines = ref(0)
const clearFx = ref({ text: '', timer: 0 })

const level = computed(() => Math.floor(lines.value / 5) + 1)
const gameOver = computed(() => gameState.value === 'gameover')

const grid = ref(createEmptyGrid())
const currentPiece = ref(null)
const nextQueue = ref([])

const keyState = {
  left: false,
  right: false,
  down: false,
}
let requireSoftDropRelease = false

let frameId = null
let lastTime = 0
let fallTimer = 0
let moveTimer = 0
let particles = []

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null))
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function buildPiece() {
  const selected = randomFrom(PIECES)
  return {
    id: selected.id,
    x: Math.floor(COLS / 2),
    y: 1,
    color: randomFrom(COLORS),
    blocks: selected.blocks.map(block => ({ ...block })),
    turn: 0,
  }
}

function getPieceCells(piece) {
  return piece.blocks.map(block => ({
    row: piece.y + block.y,
    col: piece.x + block.x,
    color: piece.color,
  }))
}

function isCellInside(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS
}

function canPlacePiece(piece) {
  for (const cell of getPieceCells(piece)) {
    if (!isCellInside(cell.row, cell.col)) return false
    if (grid.value[cell.row][cell.col]) return false
  }
  return true
}

function fillNextQueue(targetSize = 3) {
  while (nextQueue.value.length < targetSize) {
    nextQueue.value.push(buildPiece())
  }
}

function spawnPiece() {
  fillNextQueue(3)
  currentPiece.value = nextQueue.value.shift()
  fillNextQueue(3)

  currentPiece.value.x = Math.floor(COLS / 2)
  currentPiece.value.y = 2
  currentPiece.value.turn = 0

  if (!canPlacePiece(currentPiece.value)) {
    gameState.value = 'gameover'
  }
}

function rotateBlockPhase(block, direction) {
  if (direction === 1) {
    return { x: -block.y, y: block.x }
  }
  return { x: block.y, y: -block.x }
}

function rotatePiece() {
  if (!currentPiece.value || gameOver.value || gameState.value === 'paused') return

  const nextTurn = ((currentPiece.value.turn ?? 0) + 1) % 4
  const direction = 1
  const rotatedBlocks = currentPiece.value.blocks.map(block => rotateBlockPhase(block, direction))
  const kicks = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 0, y: -1 },
  ]

  for (const kick of kicks) {
    const candidate = {
      ...currentPiece.value,
      x: currentPiece.value.x + kick.x,
      y: currentPiece.value.y + kick.y,
      blocks: rotatedBlocks,
      turn: nextTurn,
    }

    if (canPlacePiece(candidate)) {
      currentPiece.value = candidate
      return
    }
  }
}

function movePiece(dx, dy) {
  if (!currentPiece.value || gameOver.value || gameState.value === 'paused') return false

  const candidate = {
    ...currentPiece.value,
    x: currentPiece.value.x + dx,
    y: currentPiece.value.y + dy,
  }

  if (!canPlacePiece(candidate)) {
    if (dy > 0) lockPiece()
    return false
  }

  currentPiece.value = candidate
  return true
}

function spawnParticles(x, y, color) {
  for (let index = 0; index < 10; index++) {
    const angle = (Math.PI * 2 * index) / 10
    const speed = 25 + Math.random() * 85
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.6 + Math.random() * 0.5,
      color,
      size: 2 + Math.random() * 2.8,
    })
  }
}

function updateParticles(dt) {
  particles = particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vy: particle.vy + 90 * dt,
      life: particle.life - dt,
      size: Math.max(0, particle.size - dt * 2.3),
    }))
    .filter(particle => particle.life > 0)
}

function calculateScore(clearedLines, colorVarietyBonus) {
  if (clearedLines <= 0) return 0
  const table = { 1: 100, 2: 300, 3: 550, 4: 850 }
  const base = table[Math.min(4, clearedLines)] || 100
  const multiLineBonus = clearedLines > 4 ? (clearedLines - 4) * 240 : 0
  return (base + multiLineBonus + colorVarietyBonus) * level.value
}

function clearLines() {
  const fullRows = []
  const colorSet = new Set()

  for (let row = 0; row < ROWS; row++) {
    const isFull = grid.value[row].every(cell => cell !== null)
    if (isFull) fullRows.push(row)
  }

  if (!fullRows.length) return 0

  for (const row of fullRows) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid.value[row][col]
      if (!cell) continue
      colorSet.add(cell.color)
      spawnParticles(col * CELL + CELL / 2, HUD_HEIGHT + row * CELL + CELL / 2, cell.color)
    }
  }

  const remainingRows = []
  for (let row = 0; row < ROWS; row++) {
    if (!fullRows.includes(row)) remainingRows.push([...grid.value[row]])
  }

  while (remainingRows.length < ROWS) {
    remainingRows.unshift(Array.from({ length: COLS }, () => null))
  }

  grid.value = remainingRows
  return {
    count: fullRows.length,
    uniqueColors: colorSet.size,
  }
}

function lockPiece() {
  const piece = currentPiece.value
  if (!piece) return
  const wasSoftDropping = keyState.down

  for (const cell of getPieceCells(piece)) {
    if (!isCellInside(cell.row, cell.col)) {
      gameState.value = 'gameover'
      return
    }

    grid.value[cell.row][cell.col] = { color: cell.color }
  }

  const clearResult = clearLines()
  if (clearResult.count > 0) {
    lines.value += clearResult.count
    const varietyBonus = clearResult.uniqueColors >= 4 ? 250 : 0
    const gained = calculateScore(clearResult.count, varietyBonus)
    score.value += gained

    const clearLabel = clearResult.count > 1 ? `LINE CLEAR x${clearResult.count}` : 'LINE CLEAR'
    const bonusLabel = varietyBonus > 0 ? '  +COLOR BONUS' : ''
    clearFx.value = {
      text: `${clearLabel}${bonusLabel}  +${gained}`,
      timer: 0.95,
    }
  }

  if (gameState.value !== 'gameover') spawnPiece()

  if (wasSoftDropping) {
    keyState.down = false
    requireSoftDropRelease = true
  }
}

function getFallInterval() {
  return Math.max(110, 700 - (level.value - 1) * 52)
}

function drawBackground(context) {
  context.fillStyle = '#021430'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.fillStyle = 'rgba(2, 20, 48, 0.62)'
  context.fillRect(0, 0, WIDTH, HUD_HEIGHT)

  context.strokeStyle = 'rgba(0, 150, 255, 0.15)'
  context.lineWidth = 1

  for (let row = 0; row <= ROWS; row++) {
    const y = HUD_HEIGHT + row * CELL
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(BOARD_WIDTH, y)
    context.stroke()
  }

  for (let col = 0; col <= COLS; col++) {
    const x = col * CELL
    context.beginPath()
    context.moveTo(x, HUD_HEIGHT)
    context.lineTo(x, HEIGHT)
    context.stroke()
  }
}

function drawNextPreview(context, piece, originX, originY) {
  if (!piece) return

  const previewCell = 6
  const previewWidth = 46
  const previewHeight = 26

  context.save()
  context.strokeStyle = 'rgba(0, 240, 255, 0.25)'
  context.strokeRect(originX, originY, previewWidth, previewHeight)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const block of piece.blocks) {
    minX = Math.min(minX, block.x)
    maxX = Math.max(maxX, block.x)
    minY = Math.min(minY, block.y)
    maxY = Math.max(maxY, block.y)
  }

  const shapeWidth = (maxX - minX + 1) * previewCell
  const shapeHeight = (maxY - minY + 1) * previewCell
  const startX = originX + Math.floor((previewWidth - shapeWidth) / 2)
  const startY = originY + Math.floor((previewHeight - shapeHeight) / 2)

  context.fillStyle = piece.color
  context.shadowColor = piece.color
  context.shadowBlur = 8

  for (const block of piece.blocks) {
    const x = startX + (block.x - minX) * previewCell
    const y = startY + (block.y - minY) * previewCell
    context.fillRect(x, y, previewCell - 1, previewCell - 1)
  }

  context.restore()
}

function drawHud(context) {
  const hudLeft = 16
  const previewOriginX = WIDTH - 58
  const previewOriginY = 20
  const previewWidth = 46
  const midBlockX = Math.floor(WIDTH * 0.30)
  const rightBlockX = Math.floor(WIDTH * 0.48)

  context.save()
  context.font = '13px "Press Start 2P"'
  context.fillStyle = '#8cb5ff'
  context.fillText('SCORE', hudLeft, 34)
  context.fillText('LEVEL', midBlockX, 34)
  context.fillText('LINES', rightBlockX, 34)

  context.fillStyle = '#00f0ff'
  context.fillText(String(score.value), hudLeft, 64)
  context.fillStyle = '#39ff88'
  context.fillText(String(level.value), midBlockX, 64)
  context.fillStyle = '#ffe066'
  context.fillText(String(lines.value), rightBlockX, 64)

  context.fillStyle = '#a8c7ff'
  context.font = '9px "Press Start 2P"'
  context.textBaseline = 'top'
  const nextLabel = 'NEXT'
  const nextLabelX = previewOriginX + Math.floor((previewWidth - context.measureText(nextLabel).width) / 2)
  context.fillText(nextLabel, nextLabelX, 6)
  drawNextPreview(context, nextQueue.value[0], previewOriginX, previewOriginY)
  drawNextPreview(context, nextQueue.value[1], previewOriginX, previewOriginY + 28)
  drawNextPreview(context, nextQueue.value[2], previewOriginX, previewOriginY + 56)

  if (clearFx.value.timer > 0) {
    context.font = '10px "Press Start 2P"'
    context.fillStyle = '#ffe066'
    context.shadowColor = '#ffe066'
    context.shadowBlur = 10
    context.fillText(clearFx.value.text, hudLeft, 92)
    context.shadowBlur = 0
  }

  context.restore()
}

function drawCell(context, row, col, color) {
  if (!color) return

  const x = col * CELL
  const y = HUD_HEIGHT + row * CELL
  const inner = 4

  context.save()
  context.shadowColor = color
  context.shadowBlur = 12
  context.fillStyle = color
  context.fillRect(x + inner, y + inner, CELL - inner * 2, CELL - inner * 2)

  context.strokeStyle = 'rgba(255,255,255,0.46)'
  context.lineWidth = 1
  context.strokeRect(x + inner, y + inner, CELL - inner * 2, CELL - inner * 2)

  context.restore()
}

function drawGrid(context) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid.value[row][col]
      drawCell(context, row, col, cell?.color)
    }
  }
}

function drawCurrentPiece(context) {
  if (!currentPiece.value) return

  for (const cell of getPieceCells(currentPiece.value)) {
    if (!isCellInside(cell.row, cell.col)) continue
    drawCell(context, cell.row, cell.col, cell.color)
  }
}

function drawParticles(context) {
  for (const particle of particles) {
    context.save()
    context.globalAlpha = Math.max(0, particle.life)
    context.fillStyle = particle.color
    context.shadowColor = particle.color
    context.shadowBlur = 10
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  drawBackground(context)
  drawHud(context)
  drawGrid(context)
  drawCurrentPiece(context)
  drawParticles(context)
}

function update(dt) {
  if (gameState.value !== 'running') return

  if (clearFx.value.timer > 0) {
    clearFx.value = {
      ...clearFx.value,
      timer: Math.max(0, clearFx.value.timer - dt),
    }
  }

  const repeat = keyState.down ? 0.045 : 0.105
  moveTimer += dt

  if (moveTimer >= repeat) {
    if (keyState.left) movePiece(-1, 0)
    if (keyState.right) movePiece(1, 0)
    moveTimer = 0
  }

  fallTimer += dt * (keyState.down ? SOFT_DROP_SPEED_MULTIPLIER : 1)
  const intervalSeconds = getFallInterval() / 1000

  if (fallTimer >= intervalSeconds) {
    movePiece(0, 1)
    fallTimer = 0
  }

  updateParticles(dt)
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min(0.032, (timestamp - lastTime) / 1000)
  lastTime = timestamp

  update(dt)
  render()
  frameId = requestAnimationFrame(loop)
}

function startGame() {
  gameState.value = 'running'
  score.value = 0
  lines.value = 0
  clearFx.value = { text: '', timer: 0 }
  grid.value = createEmptyGrid()
  currentPiece.value = null
  nextQueue.value = []
  particles = []
  fallTimer = 0
  moveTimer = 0
  spawnPiece()
}

function togglePause() {
  if (gameOver.value) return
  gameState.value = gameState.value === 'paused' ? 'running' : 'paused'
}

function resumeGame() {
  if (gameState.value === 'paused') gameState.value = 'running'
}

function onKeyDown(event) {
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
    event.preventDefault()
    keyState.left = true
  }

  if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
    event.preventDefault()
    keyState.right = true
  }

  if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
    event.preventDefault()
    if (requireSoftDropRelease) return
    keyState.down = true
    if (gameState.value === 'running') movePiece(0, 1)
  }

  if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W' || event.key === 'x' || event.key === 'X') {
    event.preventDefault()
    rotatePiece()
  }

  if (event.key === ' ' || event.key === 'Escape') {
    event.preventDefault()
    togglePause()
  }
}

function onKeyUp(event) {
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keyState.left = false
  if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keyState.right = false
  if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
    keyState.down = false
    requireSoftDropRelease = false
  }
}

onMounted(() => {
  startGame()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  frameId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  if (frameId) cancelAnimationFrame(frameId)
})
</script>
