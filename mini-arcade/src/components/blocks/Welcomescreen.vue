<template>
  <div class="welcome-screen">
    <div class="welcome-screen__grid" />

    <div class="welcome-screen__content">
      <div class="welcome-screen__title-block">
        <h1 class="welcome-screen__title">
          NEON<span class="welcome-screen__title-accent">BLOCKS</span>
        </h1>
        <p class="welcome-screen__subtitle">Retro Arcade · Neon Edition</p>
      </div>

      <div class="welcome-screen__how-to-play">
        <p class="welcome-screen__section-title">HOW TO PLAY</p>

        <ul class="welcome-screen__instructions">
          <li>
            <span class="welcome-screen__key">A/D or ←/→</span>
            <span class="welcome-screen__desc">Move piece</span>
          </li>
          <li>
            <span class="welcome-screen__key">W/↑</span>
            <span class="welcome-screen__desc">Phase rotate</span>
          </li>
          <li>
            <span class="welcome-screen__key">S/↓</span>
            <span class="welcome-screen__desc">Soft drop</span>
          </li>
          <li>
            <span class="welcome-screen__key">SPACE / ESC</span>
            <span class="welcome-screen__desc">Pause / Resume</span>
          </li>
        </ul>

        <div class="welcome-screen__rules">
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">💥</span>
            <span>Fill a full row to clear it and keep space open. Clearing multiple rows at once gives extra points. </span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">⚡</span>
            <span>Every 5 cleared lines increases level and drop speed. Color variety in one clear can grant extra score.</span>
          </div>
          <div class="welcome-screen__rule">
            <span class="welcome-screen__rule-icon">⭐</span>
            <span>Only 5-cell pentomino Neon shapes on a 15×23 grid with custom phase-kick rotation.</span>
          </div>
        </div>
      </div>

      <div class="welcome-screen__start-actions">
        <button class="welcome-screen__start-btn" @click="$emit('start')">
          <span class="welcome-screen__btn-text">START NEON BLOCKS</span>
          <span class="welcome-screen__btn-glow" />
        </button>

        <button class="welcome-screen__start-btn welcome-screen__start-btn--secondary" @click="$emit('back')">
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
