<script setup>
import { ref } from 'vue'

// Press-and-hold button for on-screen controls.
// Emits `press` on touch/mouse down and `release` on up / cancel / leave.
const props = defineProps({
  wide: { type: Boolean, default: false },
  accent: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
const emit = defineEmits(['press', 'release'])

const active = ref(false)

function press(event) {
  if (active.value) return
  active.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
  emit('press')
}

function release() {
  if (!active.value) return
  active.value = false
  emit('release')
}
</script>

<template>
  <button
    class="tbtn"
    :class="{ 'tbtn--active': active, 'tbtn--wide': props.wide, 'tbtn--accent': props.accent }"
    type="button"
    :aria-label="props.label || undefined"
    @pointerdown.prevent="press"
    @pointerup="release"
    @pointercancel="release"
    @lostpointercapture="release"
    @contextmenu.prevent
  >
    <slot />
  </button>
</template>

<style scoped>
.tbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  min-width: 44px;
  max-width: 96px;
  height: 56px;
  padding: 0 8px;
  border-radius: 14px;
  border: 2px solid rgba(0, 240, 255, 0.55);
  background: rgba(0, 30, 70, 0.72);
  color: #00f0ff;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.18);
  transition: background 0.08s, transform 0.08s;
}

.tbtn--wide {
  flex: 2 1 0;
  max-width: 200px;
}

.tbtn--accent {
  border-color: rgba(255, 106, 213, 0.75);
  color: #ff6ad5;
  box-shadow: 0 0 14px rgba(255, 106, 213, 0.22);
}

.tbtn--active {
  background: rgba(0, 240, 255, 0.3);
  transform: scale(0.94);
}

.tbtn--accent.tbtn--active {
  background: rgba(255, 106, 213, 0.3);
}
</style>
