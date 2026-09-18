import { computed, onMounted, onUnmounted, ref } from 'vue'

// Space reserved for the on-screen control bar (touch devices / narrow screens).
const BAR_H = 92
const BAR_W = 128
const GAP = 10
const PAD = 10

const TOUCH_QUERY = '(pointer: coarse), (max-width: 700px)'

/**
 * Tracks the viewport and works out how much room a game canvas can use.
 *
 * - `touch`   true on touch devices / narrow windows -> show the control bar
 * - `sideBar` true on short landscape screens -> control bar sits beside the canvas
 * - `avail`   { w, h } pixels left for the canvas
 * - `fit()`   scale factor that fits a base-sized canvas into `avail`
 */
export function useViewport() {
  const vw = ref(window.innerWidth)
  const vh = ref(window.innerHeight)
  const touch = ref(window.matchMedia(TOUCH_QUERY).matches)

  const sideBar = computed(() => touch.value && vw.value > vh.value && vh.value <= 560)

  const avail = computed(() => {
    let w = vw.value - PAD * 2
    let h = vh.value - PAD * 2
    if (touch.value) {
      if (sideBar.value) w -= BAR_W + GAP
      else h -= BAR_H + GAP
    }
    return { w: Math.max(120, w), h: Math.max(120, h) }
  })

  function fit(baseW, baseH, maxScale = Infinity) {
    return Math.min(avail.value.w / baseW, avail.value.h / baseH, maxScale)
  }

  let mq = null
  const update = () => {
    vw.value = window.innerWidth
    vh.value = window.innerHeight
  }
  const updateTouch = () => {
    touch.value = mq.matches
  }

  onMounted(() => {
    update()
    mq = window.matchMedia(TOUCH_QUERY)
    updateTouch()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    mq.addEventListener?.('change', updateTouch)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
    window.removeEventListener('orientationchange', update)
    mq?.removeEventListener?.('change', updateTouch)
  })

  return { vw, vh, touch, sideBar, avail, fit }
}
