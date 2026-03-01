<script setup>
import { ref } from 'vue'
import ArcadeMenu from './components/ArcadeMenu.vue'

// Brick Breaker components
import BrickWelcome from './components/brickbreaker/WelcomeScreen.vue'
import BrickCanvas from './components/brickbreaker/GameCanvas.vue'
import BrickCanvasEndless from './components/brickbreaker/GameCanvasEndless.vue'

// Cyber Snake components
import SnakeWelcome from './components/snake/WelcomeScreen.vue'
import SnakeCanvas from './components/snake/GameCanvas.vue'

// Pong components
import PongWelcome from './components/pong/WelcomeScreen.vue'
import PongCanvas from './components/pong/GameCanvas.vue'

// Cosmic Invaders components
import InvadersWelcome from './components/invaders/WelcomeScreen.vue'
import InvadersCanvas from './components/invaders/GameCanvas.vue'

// Neon Blocks components
import BlocksWelcome from './components/blocks/WelcomeScreen.vue'
import BlocksCanvas from './components/blocks/GameCanvas.vue'

// screen: 'arcade' | 'brickbreaker' | 'snake'
const screen = ref('arcade')

// brick breaker state
const brickStarted = ref(false)
const brickMode = ref('classic')

const startBrick = (mode = 'classic') => {
  brickMode.value = mode
  brickStarted.value = true
}

// snake state
const snakeStarted = ref(false)

// pong state
const pongStarted = ref(false)
const pongMode = ref('single')

// invaders state
const invadersStarted = ref(false)
const invadersMode = ref('classic')

const startInvaders = (mode = 'classic') => {
  invadersMode.value = mode
  invadersStarted.value = true
}

const startPong = (mode = 'single') => {
  pongMode.value = mode
  pongStarted.value = true
}

// neon blocks state
const blocksStarted = ref(false)

// navigate back to arcade menu
const goToArcade = () => {
  screen.value = 'arcade'
  brickStarted.value = false
  snakeStarted.value = false
  pongStarted.value = false
  invadersStarted.value = false
  blocksStarted.value = false
  pongMode.value = 'single'
  invadersMode.value = 'classic'
}
</script>

<template>
  <!-- ARCADE MAIN MENU -->
  <ArcadeMenu
    v-if="screen === 'arcade'"
    @play-brickbreaker="screen = 'brickbreaker'"
    @play-snake="screen = 'snake'"
    @play-pong="screen = 'pong'"
    @play-invaders="screen = 'invaders'"
    @play-blocks="screen = 'blocks'"
  />

  <!-- BRICK BREAKER -->
  <template v-else-if="screen === 'brickbreaker'">
    <BrickWelcome
      v-if="!brickStarted"
      @start="startBrick"
      @back="goToArcade"
    />
    <BrickCanvas
      v-else-if="brickMode === 'classic'"
      key="brick-classic"
      @go-home="brickStarted = false"
    />
    <BrickCanvasEndless
      v-else
      key="brick-endless"
      @go-home="brickStarted = false"
    />
  </template>

  <!-- CYBER SNAKE -->
  <template v-else-if="screen === 'snake'">
    <SnakeWelcome
      v-if="!snakeStarted"
      @start="snakeStarted = true"
      @back="goToArcade"
    />
    <SnakeCanvas
      v-else
      @menu="snakeStarted = false"
    />
  </template>

  <!-- PONG -->
  <template v-else-if="screen === 'pong'">
    <PongWelcome
      v-if="!pongStarted"
      @start="startPong"
      @back="goToArcade"
    />
    <PongCanvas
      v-else
      :key="`pong-${pongMode}`"
      :mode="pongMode"
      @menu="pongStarted = false"
    />
  </template>

  <!-- COSMIC INVADERS -->
  <template v-else-if="screen === 'invaders'">
    <InvadersWelcome
      v-if="!invadersStarted"
      @start="startInvaders"
      @back="goToArcade"
    />
    <InvadersCanvas
      v-else
      :key="`invaders-${invadersMode}`"
      :mode="invadersMode"
      @menu="invadersStarted = false"
    />
  </template>

  <!-- NEON BLOCKS -->
  <template v-else-if="screen === 'blocks'">
    <BlocksWelcome
      v-if="!blocksStarted"
      @start="blocksStarted = true"
      @back="goToArcade"
    />
    <BlocksCanvas
      v-else
      @menu="blocksStarted = false"
    />
  </template>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000;
  overflow: hidden;
}
</style>