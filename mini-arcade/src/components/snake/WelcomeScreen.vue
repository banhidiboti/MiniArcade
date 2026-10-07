<template>
  <div class="welcome-screen">
    <!-- Animated grid background -->
    <div class="welcome-screen__grid" />

    <div class="welcome-screen__content">

      <!-- Title -->
      <div class="welcome-screen__title-block">
        <h1 class="welcome-screen__title">
          CYBER<span class="welcome-screen__title-accent">SNAKE</span>
        </h1>
        <p class="welcome-screen__subtitle">Retro Arcade · Neon Edition</p>
      </div>

      <!-- How to Play box -->
      <div class="welcome-screen__how-to-play">
        <p class="welcome-screen__section-title">HOW TO PLAY</p>

        <!-- Controls -->
        <ul class="welcome-screen__instructions">
          <li>
            <span class="welcome-screen__key">A</span>
            <span class="welcome-screen__key">+ Left</span>
            <span class="welcome-screen__desc">Move left</span>
          </li>
          <li>
            <span class="welcome-screen__key">D</span>
            <span class="welcome-screen__key">+ Right</span>
            <span class="welcome-screen__desc">Move right</span>
          </li>
          <li>
            <span class="welcome-screen__key">W</span>
            <span class="welcome-screen__key">+ Up</span>
            <span class="welcome-screen__desc">Move up</span>
          </li>
          <li>
            <span class="welcome-screen__key">S</span>
            <span class="welcome-screen__key">+ Down</span>
            <span class="welcome-screen__desc">Move down</span>
          </li>
          <li>
            <span class="welcome-screen__key">SPACE</span>
            <span class="welcome-screen__key">ESC</span>
            <span class="welcome-screen__desc">Pause / Resume</span>
          </li>
        </ul>

        <!-- Rules -->
        <div class="welcome-screen__rules">
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">🐍</span>
            <span>Eat food to grow. Don't run into yourself!</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">⚡</span>
            <span>Speed increases every 5 foods eaten.</span>
          </div>

          <!-- Food scoring -->
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">🍎</span>
            <div class="welcome-screen__scoring-row">
              <div class="welcome-screen__food-preview">
                <span class="welcome-screen__food-dot" style="background:#39ff14; box-shadow: 0 0 6px #39ff14;" />
                <span class="welcome-screen__food-points">5 pts</span>
              </div>
              <div class="welcome-screen__food-preview">
                <span class="welcome-screen__food-dot" style="background:#ffe600; box-shadow: 0 0 6px #ffe600;" />
                <span class="welcome-screen__food-points">10 pts</span>
              </div>
              <div class="welcome-screen__food-preview">
                <span class="welcome-screen__food-dot" style="background:#ff006e; box-shadow: 0 0 6px #ff006e;" />
                <span class="welcome-screen__food-points">20 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Start button -->
      <div class="welcome-screen__start-actions">
        <button class="welcome-screen__start-btn" @click="$emit('start')">
          <div class="welcome-screen__btn-glow" />
          <span class="welcome-screen__btn-text">PLAY</span>
        </button>
        <button class="welcome-screen__start-btn" @click="$emit('back')">
          <div class="welcome-screen__btn-glow" />
          <span class="welcome-screen__btn-text">BACK TO ARCADE</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['start', 'back'])
</script>

<style scoped>
@import './WelcomeScreen.css';
</style>