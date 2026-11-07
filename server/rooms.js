import { scoreClip } from '../src/hazardClips.js'

const requireHost = (room, id) => { if (room.host !== id) throw new Error('Only the host can control the round.') }
export function createRoom(host, name, rounds) {
  if (!Array.isArray(rounds) || !rounds.length) throw new Error('No activities available.')
  const room = { host, players: [], rounds, index: -1, phase: 'lobby', responses: {}, missedTopics: {}, retried: false }
  joinRoom(room, host, name)
  return room
}
export function joinRoom(room, id, name) {
  if (room.phase !== 'lobby') throw new Error('This game has already started.')
  const clean = typeof name === 'string' ? name.trim().slice(0, 24) : ''
  if (!clean) throw new Error('Enter a display name.')
  if (room.players.length >= 12) throw new Error('This room is full.')
  room.players.push({ id, name: clean, score: 0 })
}
export function startRound(room, id) {
  requireHost(room, id)
  if (!['lobby', 'reveal'].includes(room.phase)) throw new Error('Finish the current round first.')
  room.index++
  room.responses = {}
  room.retried = false
  room.phase = room.index >= room.rounds.length ? 'finished' : 'playing'
}
export function submitAnswer(room, id, response) {
  if (room.phase !== 'playing' || !room.players.some(p => p.id === id)) throw new Error('No active round.')
  if (Object.hasOwn(room.responses, id)) throw new Error('Your answer is already submitted.')
  const round = room.rounds[room.index]
  if (round.type === 'hazard') {
    if (!Array.isArray(response) || response.length > 30 || response.some(x => !Number.isFinite(x) || x < 0 || x > round.clip.duration)) throw new Error('Invalid hazard response.')
  } else if (!Number.isInteger(response) || response < 0 || response >= round.options.length) throw new Error('Invalid answer.')
  room.responses[id] = response
}
export function revealRound(room, id) {
  requireHost(room, id)
  if (room.phase !== 'playing') throw new Error('No active round.')
  const round = room.rounds[room.index]
  for (const player of room.players) {
    if (!Object.hasOwn(room.responses, player.id)) continue
    player.score += round.type === 'hazard' ? scoreClip(round.clip, room.responses[player.id]).score : Number(room.responses[player.id] === round.answer)
  }
  if (round.type !== 'hazard' && round.topic) { const missed = room.players.filter(p => room.responses[p.id] !== round.answer).length; if (missed) room.missedTopics[round.topic] = (room.missedTopics[round.topic] || 0) + missed }
  room.phase = 'reveal'
}
export function retryMissed(room, id) {
  requireHost(room, id)
  const round = room.rounds[room.index]
  if (room.phase !== 'reveal' || round?.type === 'hazard' || room.retried || !room.players.some(p => room.responses[p.id] !== round.answer)) throw new Error('No missed quiz question to retry.')
  room.rounds.splice(room.index + 1, 0, round); room.retried = true
}
export function publicRoom(room) {
  const round = room.rounds[room.index]
  let shown = null
  if (round) {
    shown = round.type === 'hazard'
      ? { type: 'hazard', clip: { id: round.clip.id, duration: round.clip.duration, src: round.clip.src, ...(room.phase === 'reveal' ? { hazards: round.clip.hazards, sourceUrl: round.clip.sourceUrl, author: round.clip.author, license: round.clip.license } : {}) } }
      : { type: 'quiz', topic: round.topic, prompt: round.prompt, options: round.options, image: round.image, imageAlt: round.imageAlt, ...(room.phase === 'reveal' ? { answer: round.answer, explanation: round.explanation, source: round.source } : {}) }
  }
  return { host: room.host, phase: room.phase, index: room.index, total: room.rounds.length, retried: room.retried, canRetry: room.phase === 'reveal' && round?.type !== 'hazard' && !room.retried && room.players.some(p => room.responses[p.id] !== round.answer), missedTopics: Object.entries(room.missedTopics).map(([topic, missed]) => ({ topic, missed })).sort((a, b) => b.missed - a.missed), players: room.players.map(p => ({ ...p, answered: Object.hasOwn(room.responses, p.id), ...(room.phase === 'reveal' && round?.type === 'hazard' && Object.hasOwn(room.responses, p.id) ? { clicks: room.responses[p.id], roundScore: scoreClip(round.clip, room.responses[p.id]).score } : {}) })), round: shown }
}
