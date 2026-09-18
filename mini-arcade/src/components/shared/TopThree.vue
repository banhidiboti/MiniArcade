<script setup>
import { onMounted, ref } from 'vue'
import { fetchLeaderboard } from '../../api/scores.js'

// Top 3 players of one or more boards, shown on a game's start screen.
// boards: [{ id: 'snake', label: 'CLASSIC' }]  (label is optional)
const props = defineProps({
  boards: { type: Array, required: true },
})

const lists = ref(props.boards.map(() => ({ loading: true, entries: [], offline: false })))

onMounted(async () => {
  await Promise.all(
    props.boards.map(async (board, i) => {
      const res = await fetchLeaderboard(board.id, 3)
      lists.value[i] = res.ok
        ? { loading: false, entries: res.data.entries, offline: false }
        : { loading: false, entries: [], offline: true }
    }),
  )
})

const medals = ['🥇', '🥈', '🥉']
</script>

<template>
  <div class="top3">
    <p class="top3-title">🏆 TOP 3</p>
    <div class="top3-boards">
      <div v-for="(board, i) in boards" :key="board.id" class="top3-board">
        <p v-if="board.label" class="top3-label">{{ board.label }}</p>
        <p v-if="lists[i].loading" class="top3-empty">...</p>
        <p v-else-if="lists[i].offline" class="top3-empty">LEADERBOARD OFFLINE</p>
        <p v-else-if="!lists[i].entries.length" class="top3-empty">NO SCORES YET</p>
        <ol v-else class="top3-list">
          <li v-for="entry in lists[i].entries" :key="entry.rank">
            <span class="top3-medal">{{ medals[entry.rank - 1] }}</span>
            <span class="top3-name">{{ entry.name }}</span>
            <span class="top3-score">{{ entry.score.toLocaleString() }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top3 {
  width: 100%;
  padding: 18px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 230, 0, 0.25);
  background: rgba(0, 20, 60, 0.6);
  box-shadow: 0 0 30px rgba(255, 230, 0, 0.06), inset 0 0 40px rgba(0, 0, 40, 0.3);
}

.top3-title {
  margin: 0 0 12px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  letter-spacing: 2px;
  color: #ffe600;
}

.top3-boards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.top3-board {
  flex: 1 1 200px;
  min-width: 0;
}

.top3-label {
  margin: 0 0 8px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  letter-spacing: 1px;
  color: rgba(0, 240, 255, 0.6);
}

.top3-empty {
  margin: 4px 0;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.4);
}

.top3-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.top3-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 120, 255, 0.08);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

.top3-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.top3-score {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: #00f0ff;
  white-space: nowrap;
}
</style>
