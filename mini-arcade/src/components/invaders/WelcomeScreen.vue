<template>
  <div class="welcome-screen">
    <div class="welcome-screen__grid" />

    <div class="welcome-screen__content">
      <div class="welcome-screen__title-block">
        <h1 class="welcome-screen__title">
          COSMIC<span class="welcome-screen__title-accent">INVADERS</span>
        </h1>
        <p class="welcome-screen__subtitle">Retro Arcade · Neon Edition</p>
      </div>

      <div class="welcome-screen__how-to-play">
        <p class="welcome-screen__section-title">HOW TO PLAY</p>

        <ul class="welcome-screen__instructions">
          <li>
            <span class="welcome-screen__key">A/D or ←/→</span>
            <span class="welcome-screen__desc">Move</span>
          </li>
          <li>
            <span class="welcome-screen__key">W/↑</span>
            <span class="welcome-screen__desc">Shoot</span>
          </li>
          <li>
            <span class="welcome-screen__key">SPACE</span>
            <span class="welcome-screen__desc">Pause</span>
          </li>
        </ul>

        <div class="welcome-screen__rules">
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">👾</span>
            <span>Clear waves before they reach your base.<br>You only have 3 lives!</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">🎯</span>
            <span>Scoring: Green alien = 5 pts, Purple alien = 10 pts. Your final score is multiplied by the number of lives you have left at the end.</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">♥</span>
            <span>Endless mode keeps spawning harder waves. Each survived wave gives you +1 life.</span>
          </div>
        </div>
      </div>

      <div class="welcome-screen__start-actions">
        <button class="welcome-screen__start-btn" @click="$emit('start', 'classic')">
          <span class="welcome-screen__btn-text">CLASSIC MODE</span>
          <span class="welcome-screen__btn-glow" />
        </button>

        <button class="welcome-screen__start-btn welcome-screen__start-btn--secondary" @click="$emit('start', 'endless')">
          <span class="welcome-screen__btn-text">ENDLESS MODE</span>
          <span class="welcome-screen__btn-glow" />
        </button>

        <button class="welcome-screen__start-btn" @click="$emit('back')">
          <span class="welcome-screen__btn-text">BACK TO ARCADE</span>
          <span class="welcome-screen__btn-glow" />
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