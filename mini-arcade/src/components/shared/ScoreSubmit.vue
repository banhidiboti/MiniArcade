<script setup>
import { computed, ref } from 'vue'
import { getSavedName, saveName, submitScore } from '../../api/scores.js'

// Shown inside a game-over panel: lets the player save their score under a name
// and shows where they landed on that game's leaderboard.
const props = defineProps({
  game: { type: String, required: true },
  score: { type: Number, required: true },
  // show "POINTS n" above the form (for games whose panel does not already show the saved value)
  showScore: { type: Boolean, default: false },
})

const name = ref(getSavedName())
const status = ref('idle') // idle | saving | saved | error
const message = ref('')
const result = ref(null)

const canSave = computed(() => props.score > 0)
const cleanName = computed(() => name.value.replace(/\s+/g, ' ').trim())

async function save() {
  if (status.value === 'saving' || status.value === 'saved') return
  if (!cleanName.value) {
    status.value = 'error'
    message.value = 'Enter a name first'
    return
  }
  status.value = 'saving'
  message.value = ''
  const res = await submitScore({ name: cleanName.value, game: props.game, score: props.score })
  if (res.ok) {
    saveName(res.data.name)
    result.value = res.data
    status.value = 'saved'
  } else {
    status.value = 'error'
    message.value = res.error
  }
}
</script>

<template>
  <div v-if="canSave" class="score-submit">
    <p v-if="showScore && status !== 'saved'" class="ss-points">RANK POINTS: {{ score }}</p>
    <template v-if="status !== 'saved'">
      <label class="ss-label" for="ss-name">YOUR NAME</label>
      <div class="ss-row">
        <input
          id="ss-name"
          v-model="name"
          class="ss-input"
          type="text"
          maxlength="16"
          autocomplete="nickname"
          autocapitalize="characters"
          spellcheck="false"
          placeholder="PLAYER"
          @keydown.stop
          @keyup.stop
          @keydown.enter="save"
        />
        <button class="ss-btn" type="button" :disabled="status === 'saving'" @click="save">
          {{ status === 'saving' ? '...' : 'SAVE' }}
        </button>
      </div>
      <p v-if="status === 'error'" class="ss-msg ss-msg--error">{{ message }}</p>
    </template>

    <template v-else>
      <p class="ss-msg ss-msg--ok">
        SAVED! RANK #{{ result.rank }}<span v-if="result.personalBest"> · NEW BEST</span>
      </p>
      <ol class="ss-top">
        <li
          v-for="entry in result.top"
          :key="entry.rank"
          :class="{ 'ss-me': entry.name.toLowerCase() === result.name.toLowerCase() }"
        >
          <span class="ss-rank">{{ entry.rank }}</span>
          <span class="ss-name">{{ entry.name }}</span>
          <span class="ss-pts">{{ entry.score }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
.score-submit {
  width: 100%;
  margin: 0 0 20px;
  font-family: 'Press Start 2P', monospace;
  text-align: center;
}

.ss-points {
  margin: 0 0 12px;
  font-size: 0.6rem;
  letter-spacing: 1px;
  color: #ffe600;
}

.ss-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.55rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.45);
}

.ss-row {
  display: flex;
  gap: 8px;
}

.ss-input {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(0, 240, 255, 0.45);
  background: rgba(0, 20, 50, 0.8);
  color: #fff;
  font-family: inherit;
  font-size: 0.75rem;
  letter-spacing: 1px;
  /* 16px+ stops iOS from zooming the page on focus */
  font-size: max(16px, 0.75rem);
  text-transform: uppercase;
  outline: none;
}

.ss-input:focus {
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}

.ss-btn {
  padding: 0 16px;
  border-radius: 8px;
  border: 2px solid #44ff88;
  background: transparent;
  color: #44ff88;
  font-family: inherit;
  font-size: 0.7rem;
  letter-spacing: 1px;
  cursor: pointer;
}

.ss-btn:hover:not(:disabled) {
  background: rgba(68, 255, 136, 0.15);
}

.ss-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.ss-msg {
  margin: 8px 0 0;
  font-size: 0.58rem;
  line-height: 1.6;
  letter-spacing: 1px;
}

.ss-msg--error {
  color: #ff6b6b;
}

.ss-msg--ok {
  margin: 0 0 10px;
  color: #44ff88;
}

.ss-top {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ss-top li {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 120, 255, 0.08);
}

.ss-top li.ss-me {
  color: #ffe600;
  background: rgba(255, 230, 0, 0.12);
}

.ss-rank {
  width: 1.6em;
  text-align: right;
  opacity: 0.6;
}

.ss-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.ss-pts {
  color: #00f0ff;
}
</style>
