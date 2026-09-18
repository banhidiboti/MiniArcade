<script setup>
// Control bar shown under (or beside) the canvas on touch devices.
// Put <TouchButton> elements in the default slot.
defineProps({
  side: { type: Boolean, default: false },
})
</script>

<template>
  <div class="touch-bar" :class="{ 'touch-bar--side': side }" @contextmenu.prevent>
    <slot />
  </div>
</template>

<style scoped>
.touch-bar {
  position: relative;
  z-index: 3;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 520px;
  min-height: 72px;
  padding: 0 10px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none;
}

.touch-bar--side {
  flex-wrap: wrap;
  width: 128px;
  max-width: 128px;
  align-content: center;
  padding: 0;
}

.touch-bar--side :deep(.tbtn) {
  flex: 1 1 calc(50% - 4px);
  min-width: 0;
  max-width: none;
  height: 48px;
  padding: 0;
}

.touch-bar--side :deep(.tbtn--wide) {
  flex-basis: 100%;
}
</style>
