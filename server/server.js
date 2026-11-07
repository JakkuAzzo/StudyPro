import http from 'node:http'
import { randomBytes, randomInt, randomUUID } from 'node:crypto'
import { WebSocketServer, WebSocket } from 'ws'
import { pathToFileURL } from 'node:url'
import { drivingTheoryDeck } from '../src/drivingTheory.js'
import { builtInCourseDecks } from '../src/courseCatalog.js'
import { normalizeDeck, flattenDeck } from '../src/data.js'
import { hazardClips } from '../src/hazardClips.js'
import { getExamOptions } from '../src/examData.js'
import { createRoom, joinRoom, startRound, submitAnswer, revealRound, retryMissed, publicRoom } from './rooms.js'

const decks = [drivingTheoryDeck, ...builtInCourseDecks].map(normalizeDeck)
const shuffle = items => { const out = [...items]; for (let i = out.length - 1; i > 0; i--) { const j = randomInt(i + 1); [out[i], out[j]] = [out[j], out[i]] } return out }
export function buildQuizRound(item, items, seed) {
  const options = getExamOptions(item, items, seed).map(option => option.key)
  if (options.length < 4) return null
  return { topic: item.topic, prompt: item.question || item.definition, options, answer: options.indexOf(item.key), explanation: item.explanation, source: item.source, image: item.image, imageAlt: item.imageAlt }
}
function makeRounds(deckId, mode) {
  const deck = decks.find(x => x.id === deckId)
  if (!deck) throw new Error('Choose a built-in course.')
  if (mode === 'hazard') {
    if (!deck.features.includes('hazard')) throw new Error('Hazard clips are available for driving theory.')
    return shuffle(hazardClips).slice(0, 3).map(clip => ({ type: 'hazard', clip }))
  }
  if (mode !== 'quiz') throw new Error('Choose a valid activity.')
  const items = flattenDeck(deck)
  const rounds = shuffle(items).map(item => buildQuizRound(item, items, randomBytes(8).toString('hex'))).filter(Boolean).slice(0, 10)
  if (!rounds.length) throw new Error('This course does not have enough distinct answers for a quiz.')
  return rounds
}
export async function startServer({ port = Number(process.env.PORT || 8787), allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(x => x.trim()), requireOrigin = process.env.REQUIRE_ORIGIN === 'true' } = {}) {
  const rooms = new Map()
  const server = http.createServer((req, res) => { res.writeHead(req.url === '/health' ? 200 : 404, { 'Content-Type': 'text/plain' }); res.end(req.url === '/health' ? 'ok' : 'Not found') })
  const wss = new WebSocketServer({ server, maxPayload: 4096, verifyClient: ({ origin }) => wss.clients.size < 200 && (origin ? allowedOrigins.includes(origin) : !requireOrigin) })
  const timer = setInterval(() => { const cutoff = Date.now() - 2 * 60 * 60 * 1000; for (const [code, entry] of rooms) if (entry.updated < cutoff) { for (const ws of entry.sockets) ws.close(1000, 'Room expired'); rooms.delete(code) } }, 60000)
  timer.unref()
  server.on('close', () => clearInterval(timer))
  function send(ws, data) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)) }
  function broadcast(entry) { entry.updated = Date.now(); for (const socket of entry.sockets) send(socket, { type: 'state', code: entry.code, room: publicRoom(entry.room) }) }
  wss.on('connection', ws => {
    let entry, playerId, count = 0, windowStart = Date.now()
    ws.on('error', () => {})
    ws.on('message', raw => {
      try {
        if (Date.now() - windowStart > 10000) { count = 0; windowStart = Date.now() }
        if (++count > 50) throw new Error('Too many requests; please slow down.')
        const data = JSON.parse(raw.toString())
        if (data.action === 'create' || data.action === 'join' || data.action === 'resume') {
          if (entry) throw new Error('Leave your current room first.')
          if (data.action === 'create') {
            if (rooms.size >= 100) throw new Error('The room service is full. Try again later.')
            const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
            let code; do { code = Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('') } while (rooms.has(code))
            playerId = randomUUID()
            const room = createRoom(playerId, data.name, makeRounds(data.deckId, data.mode))
            entry = { code, room, sockets: new Set(), tokens: new Map(), updated: Date.now() }; rooms.set(code, entry)
          } else {
            entry = rooms.get(String(data.code || '').trim().toUpperCase())
            if (!entry) throw new Error('Room not found or expired.')
            if (data.action === 'resume') {
              playerId = entry.tokens.get(data.token)
              if (!playerId) throw new Error('Your room session has expired.')
              for (const existing of entry.sockets) if (existing.playerId === playerId) existing.close(1000, 'Reconnected')
            } else { playerId = randomUUID(); joinRoom(entry.room, playerId, data.name) }
          }
          const token = data.action === 'resume' ? data.token : randomBytes(24).toString('hex')
          entry.tokens.set(token, playerId); ws.playerId = playerId; entry.sockets.add(ws)
          send(ws, { type: 'joined', code: entry.code, playerId, token, room: publicRoom(entry.room) }); broadcast(entry)
        } else {
          if (!entry) throw new Error('Join a room first.')
          if (data.action === 'ping') { send(ws, { type: 'pong' }); return }
          if (data.action === 'next') startRound(entry.room, playerId)
          else if (data.action === 'answer') submitAnswer(entry.room, playerId, data.response)
          else if (data.action === 'reveal') revealRound(entry.room, playerId)
          else if (data.action === 'retry') retryMissed(entry.room, playerId)
          else throw new Error('Unknown action.')
          broadcast(entry)
        }
      } catch (error) { if (entry && !entry.sockets.has(ws)) { entry = undefined; playerId = undefined } send(ws, { type: 'error', message: error instanceof SyntaxError ? 'Invalid message.' : error.message }) }
    })
    ws.on('close', () => { if (entry) entry.sockets.delete(ws) })
  })
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, resolve) })
  return server
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) startServer().then(server => console.log(`StudyPro room service listening on ${server.address().port}`)).catch(error => { console.error(error); process.exitCode = 1 })
