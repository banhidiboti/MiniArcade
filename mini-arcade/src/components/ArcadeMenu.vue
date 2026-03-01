<template>
  <div class="arcade-root">
    <!-- Scanline overlay -->
    <div class="scanlines"></div>

    <!-- CRT vignette -->
    <div class="vignette"></div>

    <div class="runner-layer">
      <span ref="runnerARef" class="runner-line runner-line--a" :style="{ top: runnerTopA }"></span>
      <span ref="runnerBRef" class="runner-line runner-line--b" :style="{ top: runnerTopB }"></span>
    </div>

    <div class="arcade-wrap">
      <!-- Header -->
      <div class="arcade-header">
        <h1 class="arcade-title">
          <span class="title-pixel">P</span>
          <span class="title-pixel">I</span>
          <span class="title-pixel">X</span>
          <span class="title-pixel">E</span>
          <span class="title-pixel">L</span>
          <span class="title-gap"> </span>
          <span class="title-pixel accent">A</span>
          <span class="title-pixel accent">R</span>
          <span class="title-pixel accent">C</span>
          <span class="title-pixel accent">A</span>
          <span class="title-pixel accent">D</span>
          <span class="title-pixel accent">E</span>
        </h1>
        <div class="subtitle">SELECT YOUR GAME</div>
      </div>

      <!-- Game Cards -->
      <div class="game-grid">
        <!-- Brick Breaker -->
        <button class="game-card" @click="$emit('play-brickbreaker')">
          <div class="card-glow glow-cyan"></div>
          <div class="card-screen">
            <div class="mini-preview brick-preview">
              <div class="brick-row">
                <span v-for="i in 6" :key="i" class="mini-brick" :class="`b${i}`"></span>
              </div>
              <div class="brick-row">
                <span v-for="i in 6" :key="i" class="mini-brick" :class="`b${i+2}`"></span>
              </div>
              <div class="brick-row">
                <span v-for="i in 6" :key="i" class="mini-brick" :class="`b${i+1}`"></span>
              </div>
              <div class="brick-ball"></div>
              <div class="brick-paddle"></div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-number">01</div>
            <div class="card-title">BRICK<br><span class="card-title-accent">BREAKER</span></div>
            <div class="card-desc">Classic &amp; Endless modes</div>
            <div class="press-start">PRESS START ▶</div>
          </div>
        </button>

        <!-- Cyber Snake -->
        <button class="game-card" @click="$emit('play-snake')">
          <div class="card-glow glow-green"></div>
          <div class="card-screen">
            <div class="mini-preview snake-preview">
              <div
                v-for="(cell, i) in snakeCells"
                :key="i"
                class="snake-cell"
                :class="cell.type"
                :style="{ left: cell.x * 14 + 'px', top: cell.y * 14 + 'px' }"
              ></div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-number">02</div>
            <div class="card-title">CYBER<br><span class="card-title-accent">SNAKE</span></div>
            <div class="card-desc">Eat. Grow. Survive.</div>
            <div class="press-start">PRESS START ▶</div>
          </div>
        </button>

        <!-- Pong -->
        <button class="game-card" @click="$emit('play-pong')">
          <div class="card-glow glow-orange"></div>
          <div class="card-screen">
            <div class="mini-preview pong-preview">
              <div class="pong-center-line"></div>
              <div class="pong-paddle pong-paddle--left"></div>
              <div class="pong-paddle pong-paddle--right"></div>
              <div class="pong-ball"></div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-number">03</div>
            <div class="card-title">NEON<br><span class="card-title-accent">PONG</span></div>
            <div class="card-desc">Classic arcade duel</div>
            <div class="press-start">PRESS START ▶</div>
          </div>
        </button>

        <!-- Cosmic Invaders -->
        <button class="game-card" @click="$emit('play-invaders')">
          <div class="card-glow glow-orange"></div>
          <div class="card-screen">
            <div class="mini-preview invaders-preview">
              <div class="invaders-stars"></div>
              <div class="invaders-row invaders-row--a">
                <span v-for="i in 5" :key="`ia-${i}`" class="invader-sprite invader-sprite--pink"></span>
              </div>
              <div class="invaders-row invaders-row--b">
                <span v-for="i in 5" :key="`ib-${i}`" class="invader-sprite invader-sprite--green"></span>
              </div>
              <div class="invaders-player"></div>
              <div class="invaders-shot invaders-shot--player"></div>
              <div class="invaders-shot invaders-shot--enemy"></div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-number">04</div>
            <div class="card-title">COSMIC<br><span class="card-title-accent">INVADERS</span></div>
            <div class="card-desc">Defend the galaxy</div>
            <div class="press-start">PRESS START ▶</div>
          </div>
        </button>

        <!-- Under Construction -->
        <button class="game-card game-card--disabled" type="button" disabled>
          <div class="card-glow glow-orange"></div>
          <div class="card-screen">
            <div class="mini-preview construction-preview">
              <div class="construction-icon">🚧</div>
              <div class="construction-text">UNDER CONSTRUCTION</div>
            </div>
          </div>
          <div class="card-info">
            <div class="card-number">05</div>
            <div class="card-title">UNDER<br>CONSTRUCTION</div>
            <div class="card-desc">Coming soon...</div>
            <div class="press-start">UNDER CONSTRUCTION</div>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

defineEmits(['play-brickbreaker', 'play-snake', 'play-pong', 'play-invaders'])

const snakeCells = [
  { x: 2, y: 4, type: 'head' },
  { x: 3, y: 4, type: 'body' },
  { x: 4, y: 4, type: 'body' },
  { x: 5, y: 4, type: 'body' },
  { x: 5, y: 3, type: 'body' },
  { x: 5, y: 2, type: 'tail' },
  { x: 7, y: 2, type: 'food' },
]

const runnerTopA = ref('42%')
const runnerTopB = ref('68%')
const runnerARef = ref(null)
const runnerBRef = ref(null)

const randomizeRunnerTop = () => {
  const min = 8
  const max = 92
  const next = Math.floor(Math.random() * (max - min + 1)) + min
  return `${next}%`
}

onMounted(() => {
  runnerTopA.value = randomizeRunnerTop()
  runnerTopB.value = randomizeRunnerTop()

  runnerARef.value?.addEventListener('animationiteration', onRunnerAIteration)
  runnerBRef.value?.addEventListener('animationiteration', onRunnerBIteration)
})

onUnmounted(() => {
  runnerARef.value?.removeEventListener('animationiteration', onRunnerAIteration)
  runnerBRef.value?.removeEventListener('animationiteration', onRunnerBIteration)
})

const onRunnerAIteration = () => {
  runnerTopA.value = randomizeRunnerTop()
}

const onRunnerBIteration = () => {
  runnerTopB.value = randomizeRunnerTop()
}
</script>

<style scoped src="./ArcadeMenu.css"></style>