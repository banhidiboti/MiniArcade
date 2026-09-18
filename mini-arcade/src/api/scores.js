// Tiny client for the leaderboard API (server/index.js).
// Every call fails soft: if the server is offline the games keep working.

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const NAME_KEY = 'miniarcade:player-name'

export const BOARDS = [
  { id: 'overall', title: 'OVERALL', short: 'ALL' },
  { id: 'brickbreaker-classic', title: 'BRICK BREAKER · CLASSIC', short: 'BRICK' },
  { id: 'brickbreaker-endless', title: 'BRICK BREAKER · ENDLESS', short: 'BRICK ∞' },
  { id: 'snake', title: 'CYBER SNAKE', short: 'SNAKE' },
  { id: 'pong', title: 'NEON PONG', short: 'PONG' },
  { id: 'invaders-classic', title: 'COSMIC INVADERS · CLASSIC', short: 'INVADERS' },
  { id: 'invaders-endless', title: 'COSMIC INVADERS · ENDLESS', short: 'INVADERS ∞' },
  { id: 'blocks', title: 'NEON BLOCKS', short: 'BLOCKS' },
]

export function getSavedName() {
  try {
    return localStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function saveName(name) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    /* storage blocked — ignore */
  }
}

async function request(path, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, signal: controller.signal })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: data.error || `Server error (${res.status})` }
    return { ok: true, data }
  } catch {
    return { ok: false, offline: true, error: 'Leaderboard server is offline' }
  } finally {
    clearTimeout(timer)
  }
}

export function submitScore({ name, game, score }) {
  return request('/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, game, score }),
  })
}

export function fetchLeaderboard(game = 'overall', limit = 10) {
  return request(`/leaderboard?game=${encodeURIComponent(game)}&limit=${limit}`)
}
