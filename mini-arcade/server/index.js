// Mini Arcade leaderboard API — zero dependencies, plain Node.js.
//
//   GET  /api/health
//   GET  /api/boards                       -> list of boards
//   GET  /api/leaderboard?game=snake&limit=10
//   GET  /api/leaderboard?game=overall&limit=10
//   POST /api/scores   { name, game, score }
//
// Scores are appended to server/data/scores.json.
// A board ranks every player by their BEST score (names are case-insensitive).
// The "overall" board ranks players by the sum of their best score per board.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3210
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'scores.json')

const BOARDS = {
  'brickbreaker-classic': 'Brick Breaker · Classic',
  'brickbreaker-endless': 'Brick Breaker · Endless',
  snake: 'Cyber Snake',
  pong: 'Neon Pong',
  'invaders-classic': 'Cosmic Invaders · Classic',
  'invaders-endless': 'Cosmic Invaders · Endless',
  blocks: 'Neon Blocks',
}

const MAX_SCORE = 10_000_000
const MAX_NAME = 16
const NAME_RE = /^[\p{L}\p{N} _.\-']+$/u
const MAX_BODY = 2048
const RATE_LIMIT = 30 // submissions per minute per IP

// ── Storage ────────────────────────────────────────────────────────────────

/** @type {{id:number,name:string,game:string,score:number,createdAt:string}[]} */
let scores = []
let nextId = 1

function load() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    if (Array.isArray(parsed)) scores = parsed
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('Could not read scores file, starting empty:', err.message)
  }
  nextId = scores.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1
}

let saveTimer = null
function scheduleSave() {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    flush()
  }, 200)
}

function flush() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${DATA_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(scores))
  fs.renameSync(tmp, DATA_FILE)
}

// ── Ranking ────────────────────────────────────────────────────────────────

const byBest = (a, b) => b.score - a.score || a.reachedAt.localeCompare(b.reachedAt)

/** Best score per player for one board, sorted best first. */
function boardEntries(game) {
  const best = new Map()
  const plays = new Map()
  for (const s of scores) {
    if (s.game !== game) continue
    const key = s.name.toLowerCase()
    plays.set(key, (plays.get(key) || 0) + 1)
    const cur = best.get(key)
    if (!cur || s.score > cur.score) {
      best.set(key, { name: s.name, score: s.score, reachedAt: s.createdAt })
    }
  }
  return [...best.entries()]
    .map(([key, entry]) => ({ ...entry, plays: plays.get(key) }))
    .sort(byBest)
    .map((entry, i) => ({ rank: i + 1, ...entry }))
}

/** Sum of each player's best score across all boards. */
function overallEntries() {
  const totals = new Map()
  for (const game of Object.keys(BOARDS)) {
    for (const e of boardEntries(game)) {
      const key = e.name.toLowerCase()
      const cur = totals.get(key) || { name: e.name, score: 0, games: 0, reachedAt: e.reachedAt }
      cur.score += e.score
      cur.games += 1
      if (e.reachedAt > cur.reachedAt) cur.reachedAt = e.reachedAt
      totals.set(key, cur)
    }
  }
  return [...totals.values()].sort(byBest).map((entry, i) => ({ rank: i + 1, ...entry }))
}

function getLeaderboard(game) {
  return game === 'overall' ? overallEntries() : boardEntries(game)
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function send(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
  })
  res.end(payload)
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Body too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}
setInterval(() => {
  const now = Date.now()
  for (const [ip, times] of hits) {
    if (!times.some((t) => now - t < 60_000)) hits.delete(ip)
  }
}, 60_000).unref()

function cleanName(raw) {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/\s+/g, ' ').trim()
  if (!name || [...name].length > MAX_NAME || !NAME_RE.test(name)) return null
  return name
}

// ── Routes ─────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS)
      res.end()
      return
    }

    const url = new URL(req.url, 'http://localhost')

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, scores: scores.length })
    }

    if (req.method === 'GET' && url.pathname === '/api/boards') {
      return send(res, 200, {
        boards: [
          { id: 'overall', title: 'Overall' },
          ...Object.entries(BOARDS).map(([id, title]) => ({ id, title })),
        ],
      })
    }

    if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      const game = url.searchParams.get('game') || 'overall'
      if (game !== 'overall' && !BOARDS[game]) return send(res, 400, { error: 'Unknown game' })
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit'), 10) || 10))
      const entries = getLeaderboard(game)
      return send(res, 200, { game, total: entries.length, entries: entries.slice(0, limit) })
    }

    if (req.method === 'POST' && url.pathname === '/api/scores') {
      const ip = req.socket.remoteAddress || 'unknown'
      if (rateLimited(ip)) return send(res, 429, { error: 'Too many requests, slow down' })

      const body = await readJson(req)
      const name = cleanName(body.name)
      if (!name) {
        return send(res, 400, { error: `Name must be 1-${MAX_NAME} characters (letters, numbers, space, _ . - ')` })
      }
      if (!BOARDS[body.game]) return send(res, 400, { error: 'Unknown game' })
      const score = body.score
      if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
        return send(res, 400, { error: `Score must be an integer between 0 and ${MAX_SCORE}` })
      }

      const previousBest = boardEntries(body.game).find((e) => e.name.toLowerCase() === name.toLowerCase())
      scores.push({ id: nextId++, name, game: body.game, score, createdAt: new Date().toISOString() })
      scheduleSave()

      const entries = boardEntries(body.game)
      const me = entries.find((e) => e.name.toLowerCase() === name.toLowerCase())
      return send(res, 201, {
        ok: true,
        name,
        game: body.game,
        score,
        rank: me.rank,
        best: me.score,
        personalBest: !previousBest || score > previousBest.score,
        total: entries.length,
        top: entries.slice(0, 5),
      })
    }

    send(res, 404, { error: 'Not found' })
  } catch (err) {
    const status = err.status || 500
    if (status === 500) console.error(err)
    send(res, status, { error: status === 500 ? 'Server error' : err.message })
  }
})

load()
server.listen(PORT, () => {
  console.log(`Mini Arcade API listening on http://localhost:${PORT}  (${scores.length} scores loaded)`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (saveTimer) clearTimeout(saveTimer)
    flush()
    process.exit(0)
  })
}
