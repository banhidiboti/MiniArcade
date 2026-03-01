<template>
  <div class="screen">
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" :width="WIDTH" :height="HEIGHT"></canvas>

      <div v-if="state === 'paused'" class="overlay">
        <div class="panel panel--pause">
          <div class="panel-icon">⏸</div>
          <h1>PAUSED</h1>
          <p class="pause-hint">Press SPACE or ESC to continue</p>
          <div class="btn-group">
            <button class="btn" @click="resumeGame">RESUME</button>
            <button class="btn" @click="startGame">NEW GAME</button>
            <button class="btn" @click="$emit('menu')">MAIN MENU</button>
          </div>
        </div>
      </div>

      <div v-if="state === 'won' && !isEndless" class="overlay">
        <div class="panel panel--win">
          <div class="panel-icon">🚀</div>
          <h1>MISSION COMPLETE</h1>
          <p class="final-score">{{ finalScore }}</p>
          <div class="btn-group">
            <button class="btn" @click="startGame">PLAY AGAIN</button>
            <button class="btn" @click="$emit('menu')">MAIN MENU</button>
          </div>
        </div>
      </div>

      <div v-if="state === 'gameover'" class="overlay">
        <div class="panel panel--lose">
          <div class="panel-icon">💀</div>
          <h1>GAME OVER</h1>
          <p class="final-score">{{ finalScore }}</p>
          <div class="btn-group">
            <button class="btn" @click="startGame">RETRY</button>
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

const props = defineProps({
  mode: {
    type: String,
    default: 'classic',
  },
})

defineEmits(['menu'])

const isEndless = computed(() => props.mode === 'endless')

const WIDTH = 640
const HEIGHT = 720
const HUD_HEIGHT = 56

const state = ref('running')
const score = ref(0)
const lives = ref(3)
const wave = ref(1)
const canvasRef = ref(null)
const finalScore = computed(() => {
  if (isEndless.value) return score.value
  const multiplier = lives.value >= 2 ? lives.value : 1
  return score.value * multiplier
})

const player = {
  x: WIDTH / 2 - 28,
  y: HEIGHT - 60,
  width: 56,
  height: 16,
  speed: 370,
}

const alienLayout = {
  rows: 5,
  cols: 10,
  width: 28,
  height: 20,
  spacingX: 48,
  spacingY: 38,
  startX: 76,
  startY: 110,
  dropStep: 18,
}

const keyState = {
  left: false,
  right: false,
  shoot: false,
}

const PURPLE_INVADER_POINTS = 10
const GREEN_INVADER_POINTS = 5

let bullets = []
let enemyBullets = []
let particles = []
let aliens = []
let aliveAliens = 0
let alienDirection = 1
let alienSpeed = 30
let shootCooldown = 0
let enemyShotTimer = 0
let enemyShotDelay = 0.62
let frameId = null
let lastTime = 0

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getAlienPoints(alien) {
  return alien.row < 2 ? PURPLE_INVADER_POINTS : GREEN_INVADER_POINTS
}

function randomEnemyShotDelay() {
  const base = 0.4 + Math.random() * 0.45
  return Math.max(0.14, base - (wave.value - 1) * 0.03)
}

function spawnAliens() {
  aliens = []
  for (let row = 0; row < alienLayout.rows; row++) {
    for (let col = 0; col < alienLayout.cols; col++) {
      aliens.push({
        x: alienLayout.startX + col * alienLayout.spacingX,
        y: alienLayout.startY + row * alienLayout.spacingY,
        row,
        alive: true,
        frame: row % 2,
      })
    }
  }
  aliveAliens = aliens.length
}

function resetRoundVariables() {
  bullets = []
  enemyBullets = []
  particles = []
  keyState.left = false
  keyState.right = false
  keyState.shoot = false
  shootCooldown = 0
  enemyShotTimer = 0
  enemyShotDelay = randomEnemyShotDelay()
  alienDirection = 1
  alienSpeed = 30 + (wave.value - 1) * 6
  player.x = WIDTH / 2 - player.width / 2
  spawnAliens()
}

function startGame() {
  state.value = 'running'
  score.value = 0
  lives.value = 3
  wave.value = 1
  resetRoundVariables()
}

function startNextWave() {
  state.value = 'running'
  wave.value += 1
  lives.value = Math.min(3, lives.value + 1)
  resetRoundVariables()
}

function resumeGame() {
  if (state.value === 'paused') state.value = 'running'
}

function togglePause() {
  if (state.value === 'running') state.value = 'paused'
  else if (state.value === 'paused') state.value = 'running'
}

function onKeyDown(event) {
  if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') {
    event.preventDefault()
    keyState.left = true
  }

  if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') {
    event.preventDefault()
    keyState.right = true
  }

  if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
    event.preventDefault()
    keyState.shoot = true
  }

  const isPauseKey = event.key === ' ' || event.key === 'Escape' || event.key === 'Esc' || event.code === 'Escape'
  if (isPauseKey) {
    event.preventDefault()
    togglePause()
  }
}

function onKeyUp(event) {
  if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') keyState.left = false
  if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') keyState.right = false
  if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') keyState.shoot = false
}

function intersects(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function tryShoot() {
  if (bullets.length >= 2) return
  bullets.push({
    x: player.x + player.width / 2 - 1.5,
    y: player.y - 10,
    w: 3,
    h: 10,
  })
}

function getAliveBottomAliensByColumn() {
  const byColumn = Array.from({ length: alienLayout.cols }, () => [])
  for (const alien of aliens) {
    if (!alien.alive) continue
    const col = Math.round((alien.x - alienLayout.startX) / alienLayout.spacingX)
    if (col >= 0 && col < alienLayout.cols) byColumn[col].push(alien)
  }

  const shooters = []
  for (const column of byColumn) {
    if (!column.length) continue
    let bottom = column[0]
    for (const alien of column) if (alien.y > bottom.y) bottom = alien
    shooters.push(bottom)
  }
  return shooters
}

function enemyShoot() {
  const shooters = getAliveBottomAliensByColumn()
  if (!shooters.length) return

  const shooter = shooters[Math.floor(Math.random() * shooters.length)]
  enemyBullets.push({
    x: shooter.x + alienLayout.width / 2 - 2,
    y: shooter.y + alienLayout.height + 3,
    w: 4,
    h: 12,
  })
}

function spawnParticles(x, y, color) {
  for (let index = 0; index < 8; index++) {
    const angle = (Math.PI * 2 * index) / 8
    const speed = 45 + Math.random() * 70
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.36,
      size: 2 + Math.random() * 2,
      color,
    })
  }
}

function updatePlayer(dt) {
  if (keyState.left) player.x -= player.speed * dt
  if (keyState.right) player.x += player.speed * dt
  player.x = clamp(player.x, 12, WIDTH - player.width - 12)

  shootCooldown -= dt
  if (keyState.shoot && shootCooldown <= 0) {
    tryShoot()
    shootCooldown = 0.2
  }
}

function updateAliens(dt) {
  const alive = aliens.filter((alien) => alien.alive)
  if (!alive.length) {
    if (isEndless.value) startNextWave()
    else state.value = 'won'
    return
  }

  const minX = Math.min(...alive.map((alien) => alien.x))
  const maxX = Math.max(...alive.map((alien) => alien.x + alienLayout.width))

  if ((alienDirection > 0 && maxX >= WIDTH - 14) || (alienDirection < 0 && minX <= 14)) {
    alienDirection *= -1
    for (const alien of alive) alien.y += alienLayout.dropStep
  } else {
    for (const alien of alive) alien.x += alienDirection * alienSpeed * dt
  }

  for (const alien of alive) {
    if (alien.y + alienLayout.height >= player.y) {
      lives.value = 0
      state.value = 'gameover'
      return
    }
  }

  const destroyed = alienLayout.rows * alienLayout.cols - aliveAliens
  alienSpeed = 30 + (wave.value - 1) * 6 + destroyed * 1.2

  enemyShotTimer += dt
  if (enemyShotTimer >= enemyShotDelay) {
    enemyShoot()
    enemyShotTimer = 0
    enemyShotDelay = randomEnemyShotDelay()
  }
}

function updateBullets(dt) {
  for (const bullet of bullets) bullet.y -= 520 * dt
  bullets = bullets.filter((bullet) => bullet.y + bullet.h > HUD_HEIGHT)

  for (const bullet of enemyBullets) bullet.y += 255 * dt
  enemyBullets = enemyBullets.filter((bullet) => bullet.y < HEIGHT)
}

function updateParticles(dt) {
  particles = particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      life: particle.life - dt,
      size: Math.max(0, particle.size - dt * 3.4),
    }))
    .filter((particle) => particle.life > 0)
}

function handleCollisions() {
  for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = bullets[bulletIndex]

    for (let alienIndex = 0; alienIndex < aliens.length; alienIndex++) {
      const alien = aliens[alienIndex]
      if (!alien.alive) continue

      if (!intersects(bullet.x, bullet.y, bullet.w, bullet.h, alien.x, alien.y, alienLayout.width, alienLayout.height)) {
        continue
      }

      alien.alive = false
      aliveAliens -= 1
      score.value += getAlienPoints(alien)
      spawnParticles(alien.x + alienLayout.width / 2, alien.y + alienLayout.height / 2, '#00ff87')
      bullets.splice(bulletIndex, 1)
      break
    }
  }

  for (let bulletIndex = enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = enemyBullets[bulletIndex]

    if (!intersects(bullet.x, bullet.y, bullet.w, bullet.h, player.x, player.y, player.width, player.height)) {
      continue
    }

    enemyBullets.splice(bulletIndex, 1)
    lives.value -= 1
    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff6b6b')

    if (lives.value <= 0) {
      state.value = 'gameover'
      return
    }
  }
}

function drawHUD(context) {
  context.save()
  context.fillStyle = 'rgba(2, 20, 48, 0.58)'
  context.fillRect(0, 0, WIDTH, HUD_HEIGHT)

  context.strokeStyle = 'rgba(0, 150, 255, 0.2)'
  context.beginPath()
  context.moveTo(0, HUD_HEIGHT)
  context.lineTo(WIDTH, HUD_HEIGHT)
  context.stroke()

  context.font = "12px 'Press Start 2P'"
  context.textAlign = 'left'
  context.fillStyle = 'rgba(0,240,255,0.55)'
  context.fillText('SCORE:', 16, 33)
  context.fillStyle = '#00f0ff'
  context.fillText(String(score.value), 108, 33)

  if (isEndless.value) {
    context.textAlign = 'center'
    context.fillStyle = 'rgba(0,240,255,0.55)'
    context.fillText('WAVE:', WIDTH / 2 - 18, 33)
    context.fillStyle = '#00f0ff'
    context.fillText(String(wave.value), WIDTH / 2 + 42, 33)
  }

  context.textAlign = 'right'
  context.fillStyle = 'rgba(0,240,255,0.55)'
  const livesText = Array.from({ length: 3 }, (_, index) => (index < lives.value ? '♥' : '♡')).join(' ')
  context.font = "14px 'Segoe UI Symbol'"
  const livesTextWidth = context.measureText('♥ ♥ ♥').width
  context.font = "12px 'Press Start 2P'"
  context.fillText('LIVES:', WIDTH - 24 - livesTextWidth, 33)
  context.fillStyle = '#00f0ff'
  context.font = "14px 'Segoe UI Symbol'"
  context.fillText(livesText, WIDTH - 18, 33)
  context.restore()
}

function drawBackground(context) {
  context.fillStyle = '#021430'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.save()
  context.strokeStyle = 'rgba(0, 120, 255, 0.12)'
  context.lineWidth = 1
  for (let y = HUD_HEIGHT; y <= HEIGHT; y += 28) {
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(WIDTH, y)
    context.stroke()
  }
  context.restore()
}

function drawPlayer(context) {
  const shipPattern = [
    '00000100000',
    '00001110000',
    '00111111100',
    '01111111110',
    '11110101111',
    '11111111111',
    '01100110010',
  ]

  const unit = Math.max(2, Math.floor(player.height / shipPattern.length))
  const spriteWidth = shipPattern[0].length * unit
  const spriteHeight = shipPattern.length * unit
  const spriteX = player.x + (player.width - spriteWidth) / 2
  const spriteY = player.y + (player.height - spriteHeight) / 2

  context.save()
  context.shadowColor = '#00f0ff'
  context.shadowBlur = 14
  context.fillStyle = '#00f0ff'

  for (let row = 0; row < shipPattern.length; row++) {
    for (let col = 0; col < shipPattern[row].length; col++) {
      if (shipPattern[row][col] === '1') {
        context.fillRect(spriteX + col * unit, spriteY + row * unit, unit, unit)
      }
    }
  }

  context.fillStyle = '#a8f7ff'
  context.shadowBlur = 8
  context.fillRect(spriteX + 5 * unit, spriteY + 2 * unit, unit, unit)
  context.fillRect(spriteX + 4 * unit, spriteY + 3 * unit, 3 * unit, unit)

  context.fillStyle = '#39ff88'
  context.shadowColor = '#39ff88'
  context.shadowBlur = 10
  context.fillRect(spriteX + 1 * unit, spriteY + 6 * unit, unit, unit)
  context.fillRect(spriteX + 9 * unit, spriteY + 6 * unit, unit, unit)

  context.restore()
}

function drawAlien(context, alien) {
  const pixel = 3
  const pattern = alien.frame
    ? ['01100110', '11111111', '10111101', '11111111', '00100100']
    : ['01100110', '11111111', '10111101', '11111111', '01000010']

  const glow = alien.row < 2 ? '#ff6ad5' : '#39ff88'
  context.save()
  context.shadowColor = glow
  context.shadowBlur = 10
  context.fillStyle = glow

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col] === '1') {
        context.fillRect(alien.x + col * pixel, alien.y + row * pixel, pixel, pixel)
      }
    }
  }

  context.restore()
}

function drawAliens(context) {
  for (const alien of aliens) {
    if (!alien.alive) continue
    drawAlien(context, alien)
  }
}

function drawBullets(context) {
  context.save()
  context.shadowColor = '#ffe600'
  context.shadowBlur = 8
  context.fillStyle = '#ffe600'
  for (const bullet of bullets) context.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
  context.restore()

  context.save()
  context.shadowColor = '#ff6b6b'
  context.shadowBlur = 8
  context.fillStyle = '#ff6b6b'
  for (const bullet of enemyBullets) context.fillRect(bullet.x, bullet.y, bullet.w, bullet.h)
  context.restore()
}

function drawParticles(context) {
  for (const particle of particles) {
    context.save()
    context.globalAlpha = particle.life * 2
    context.fillStyle = particle.color
    context.shadowColor = particle.color
    context.shadowBlur = 7
    context.fillRect(particle.x, particle.y, particle.size, particle.size)
    context.restore()
  }
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const context = canvas.getContext('2d')

  drawBackground(context)
  drawHUD(context)
  drawAliens(context)
  drawPlayer(context)
  drawBullets(context)
  drawParticles(context)
}

function update(dt) {
  if (state.value !== 'running') return

  updatePlayer(dt)
  updateAliens(dt)
  updateBullets(dt)
  handleCollisions()
  updateParticles(dt)
}

function loop(time) {
  if (!lastTime) lastTime = time
  const dt = Math.min((time - lastTime) / 1000, 0.033)
  lastTime = time

  update(dt)
  render()
  frameId = requestAnimationFrame(loop)
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
  cancelAnimationFrame(frameId)
})
</script>

<style scoped>
/* all styles in GameCanvas.css */
</style>
