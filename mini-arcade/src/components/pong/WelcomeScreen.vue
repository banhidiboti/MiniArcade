<template>
  <div class="welcome-screen">
    <div class="welcome-screen__grid" />

    <div class="welcome-screen__content">
      <div class="welcome-screen__title-block">
        <h1 class="welcome-screen__title">
          NEON<span class="welcome-screen__title-accent">PONG</span>
        </h1>
        <p class="welcome-screen__subtitle">Retro Arcade · Neon Edition</p>
      </div>

      <div class="welcome-screen__how-to-play">
        <p class="welcome-screen__section-title">HOW TO PLAY</p>

        <ul class="welcome-screen__instructions">
          <li>
            <span class="welcome-screen__key">W / ↑</span>
            <span class="welcome-screen__desc">UP</span>
          </li>
          <li>
            <span class="welcome-screen__key">S / ↓</span>
            <span class="welcome-screen__desc">DOWN</span>
          </li>
          <li>
            <span class="welcome-screen__key">SPACE</span>
            <span class="welcome-screen__key">ESC</span>
            <span class="welcome-screen__desc">Pause / Resume</span>
          </li>
        </ul>

        <div class="welcome-screen__rules">
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">🏓</span>
            <span>Beat the enemy by sending the ball past the right paddle.</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">⚡</span>
            <span>Each paddle hit increases ball speed.</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">🎯</span>
            <div class="welcome-screen__scoring-row">
              <div class="welcome-screen__food-preview">
                <span class="welcome-screen__food-dot" style="background:#00f0ff; box-shadow: 0 0 6px #00f0ff;" />
                <span class="welcome-screen__food-points">First to 7 points wins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="welcome-screen__start-actions">
        <button class="welcome-screen__start-btn" @click="$emit('start', 'single')">
          <div class="welcome-screen__btn-glow" />
          <span class="welcome-screen__btn-text">1 PLAYER</span>
        </button>
        <button class="welcome-screen__start-btn" @click="$emit('start', 'pvp')">
          <div class="welcome-screen__btn-glow" />
          <span class="welcome-screen__btn-text">1V1 (2 PLAYER)</span>
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