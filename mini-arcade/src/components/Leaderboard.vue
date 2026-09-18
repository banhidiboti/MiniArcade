<script setup>
import { computed, onMounted, ref } from 'vue'
import { BOARDS, fetchLeaderboard, getSavedName } from '../api/scores.js'

defineEmits(['back'])

const active = ref('overall')
const entries = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const myName = getSavedName().toLowerCase()

const activeBoard = computed(() => BOARDS.find((b) => b.id === active.value))
const isOverall = computed(() => active.value === 'overall')

let requestId = 0
async function load(id = active.value) {
  active.value = id
  const current = ++requestId
  loading.value = true
  error.value = ''
  const res = await fetchLeaderboard(id, 50)
  if (current !== requestId) return // a newer tab was picked meanwhile
  loading.value = false
  if (res.ok) {
    entries.value = res.data.entries
    total.value = res.data.total
  } else {
    entries.value = []
    total.value = 0
    error.value = res.error
  }
}

onMounted(() => load('overall'))
</script>

<template>
  <div class="lb-root">
    <div class="lb-grid"></div>

    <div class="lb-content">
      <h1 class="lb-title">HALL OF <span>FAME</span></h1>

      <div class="lb-tabs" role="tablist">
        <button
          v-for="board in BOARDS"
          :key="board.id"
          class="lb-tab"
          :class="{ 'lb-tab--on': board.id === active }"
          role="tab"
          :aria-selected="board.id === active"
          @click="load(board.id)"
        >
          {{ board.short }}
        </button>
      </div>

      <div class="lb-panel">
        <p class="lb-board-name">{{ activeBoard.title }}</p>

        <p v-if="loading" class="lb-state">LOADING...</p>

        <div v-else-if="error" class="lb-state lb-state--error">
          <p>{{ error }}</p>
          <button class="lb-retry" @click="load()">RETRY</button>
        </div>

        <p v-else-if="!entries.length" class="lb-state">NO SCORES YET. BE THE FIRST!</p>

        <ol v-else class="lb-list">
          <li
            v-for="entry in entries"
            :key="entry.name"
            class="lb-row"
            :class="[`lb-row--${entry.rank}`, { 'lb-row--me': entry.name.toLowerCase() === myName }]"
          >
            <span class="lb-rank">{{ entry.rank }}</span>
            <span class="lb-name">{{ entry.name }}</span>
            <span v-if="isOverall" class="lb-games">{{ entry.games }} {{ entry.games === 1 ? 'GAME' : 'GAMES' }}</span>
            <span class="lb-score">{{ entry.score.toLocaleString() }}</span>
          </li>
        </ol>

        <p v-if="isOverall && !loading && !error" class="lb-note">SUM OF EACH PLAYER'S BEST SCORE IN EVERY GAME</p>
      </div>

      <button class="lb-back" @click="$emit('back')">BACK TO ARCADE</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap');

.lb-root {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #04040f;
  display: flex;
  font-family: 'Share Tech Mono', monospace;
  -webkit-overflow-scrolling: touch;
}

.lb-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 120, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 120, 255, 0.07) 1px, transparent 1px),
    radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.75) 100%);
  background-size: 40px 40px, 40px 40px, 100% 100%;
}

.lb-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 640px;
  margin: auto;
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.lb-title {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(1.1rem, 5vw, 2rem);
  line-height: 1.3;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 30px rgba(0, 200, 255, 0.4);
}

.lb-title span {
  color: #ffe600;
  text-shadow: 0 0 20px #ffe600, 0 0 50px rgba(255, 230, 0, 0.4);
}

.lb-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.lb-tab {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 150, 255, 0.35);
  background: rgba(0, 20, 60, 0.6);
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  letter-spacing: 1px;
  cursor: pointer;
  touch-action: manipulation;
}

.lb-tab:hover {
  color: #fff;
  border-color: rgba(0, 240, 255, 0.7);
}

.lb-tab--on {
  color: #00f0ff;
  border-color: #00f0ff;
  background: rgba(0, 240, 255, 0.12);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.25);
}

.lb-panel {
  width: 100%;
  padding: 20px 16px;
  border-radius: 16px;
  border: 1px solid rgba(0, 150, 255, 0.2);
  background: rgba(0, 20, 60, 0.6);
  box-shadow: 0 0 40px rgba(0, 80, 200, 0.15), inset 0 0 40px rgba(0, 0, 40, 0.3);
}

.lb-board-name {
  margin: 0 0 16px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  line-height: 1.6;
  letter-spacing: 2px;
  color: rgba(0, 240, 255, 0.65);
}

.lb-state {
  margin: 24px 0;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.5);
}

.lb-state--error {
  color: #ff6b6b;
}

.lb-retry,
.lb-back {
  padding: 12px 24px;
  border-radius: 10px;
  border: 2px solid #00f0ff;
  background: transparent;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  letter-spacing: 2px;
  cursor: pointer;
  touch-action: manipulation;
}

.lb-retry {
  margin-top: 12px;
}

.lb-retry:hover,
.lb-back:hover {
  background: rgba(0, 240, 255, 0.12);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.35);
}

.lb-back {
  width: 100%;
  max-width: 360px;
}

.lb-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  background: rgba(0, 120, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.lb-rank {
  width: 2ch;
  text-align: right;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  opacity: 0.7;
}

.lb-name {
  text-align: left;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-games {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.lb-score {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  color: #00f0ff;
  white-space: nowrap;
}

.lb-row--1 { background: rgba(255, 215, 0, 0.14); }
.lb-row--1 .lb-rank { color: #ffd700; opacity: 1; }
.lb-row--2 { background: rgba(200, 210, 225, 0.12); }
.lb-row--2 .lb-rank { color: #d0d8e4; opacity: 1; }
.lb-row--3 { background: rgba(205, 127, 50, 0.14); }
.lb-row--3 .lb-rank { color: #e0955a; opacity: 1; }

.lb-row--me {
  outline: 1px solid rgba(255, 230, 0, 0.7);
}

.lb-row--me .lb-name {
  color: #ffe600;
}

.lb-note {
  margin: 14px 0 0;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 480px) {
  .lb-content { gap: 16px; padding: 20px 12px; }
  .lb-panel { padding: 16px 10px; }
  .lb-row { gap: 8px; padding: 8px 8px; font-size: 0.9rem; }
  .lb-score { font-size: 0.62rem; }
  .lb-games { display: none; }
}
</style>
