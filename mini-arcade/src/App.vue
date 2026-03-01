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

// navigate back to arcade menu
const goToArcade = () => {
  screen.value = 'arcade'
  brickStarted.value = false
  snakeStarted.value = false
}
</script>

<template>
  <!-- ARCADE MAIN MENU -->
  <ArcadeMenu
    v-if="screen === 'arcade'"
    @play-brickbreaker="screen = 'brickbreaker'"
    @play-snake="screen = 'snake'"
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